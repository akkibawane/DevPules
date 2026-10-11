import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import PipelineStream from './components/PipelineStream';
import DeploymentTimeline from './components/DeploymentTimeline';
import ApiHealthGrid from './components/ApiHealthGrid';
import IncidentCenter from './components/IncidentCenter';
import DeveloperActivityFeed from './components/DeveloperActivityFeed';
import SimulationControls from './components/SimulationControls';
import { useWebSocket } from './hooks/useWebSocket';
import { fetchInitialData, triggerSimulationEvent, resolveIncident } from './services/api';

const INITIAL_METRICS = {
  buildSuccessRate: 95.8,
  totalBuilds24h: 96,
  failedBuilds24h: 4,
  deploysToday: 18,
  avgLeadTimeMinutes: 16,
  activeIncidents: 1,
  mttrMinutes: 22,
  apiUptime: 99.94,
  avgLatencyMs: 38,
};

const INITIAL_SERVICES = [
  { name: 'api-gateway', status: 'HEALTHY', latencyMs: 24, uptime: 99.98 },
  { name: 'auth-service', status: 'HEALTHY', latencyMs: 18, uptime: 99.99 },
  { name: 'payment-service', status: 'DEGRADED', latencyMs: 82, uptime: 99.45 },
  { name: 'order-processing', status: 'HEALTHY', latencyMs: 35, uptime: 99.91 },
  { name: 'notification-service', status: 'HEALTHY', latencyMs: 14, uptime: 100.0 },
];

const INITIAL_BUILDS = [
  {
    id: 'b-101',
    pipelineName: 'devpulse-backend-ci',
    source: 'GITHUB',
    buildNumber: '284',
    branch: 'main',
    commitHash: 'e71f92b4a',
    author: 'alex-dev',
    status: 'SUCCESS',
    durationSeconds: 78,
  },
  {
    id: 'b-102',
    pipelineName: 'auth-service-deploy',
    source: 'JENKINS',
    buildNumber: '142',
    branch: 'release/v2.4',
    commitHash: '9a31f7c8d',
    author: 'sarah-ops',
    status: 'RUNNING',
    durationSeconds: 42,
  },
  {
    id: 'b-103',
    pipelineName: 'payment-gateway-e2e',
    source: 'GITHUB',
    buildNumber: '89',
    branch: 'fix/stripe-webhook',
    commitHash: 'b432a188f',
    author: 'marcus-fin',
    status: 'FAILED',
    durationSeconds: 54,
  },
];

const INITIAL_DEPLOYMENTS = [
  {
    id: 'd-1',
    serviceName: 'api-gateway',
    environment: 'production',
    version: '2.4.1',
    deployedBy: 'argocd-bot',
    commitHash: 'e71f92b',
    status: 'DEPLOYED',
    timeAgo: '12m ago',
  },
  {
    id: 'd-2',
    serviceName: 'payment-service',
    environment: 'canary',
    version: '2.5.0-rc1',
    deployedBy: 'marcus-fin',
    commitHash: 'b432a18',
    status: 'IN_PROGRESS',
    timeAgo: '2m ago',
  },
  {
    id: 'd-3',
    serviceName: 'order-processing',
    environment: 'staging',
    version: '2.4.0',
    deployedBy: 'sarah-ops',
    commitHash: '89ac231',
    status: 'DEPLOYED',
    timeAgo: '45m ago',
  },
];

const INITIAL_INCIDENTS = [
  {
    id: 'inc-1',
    title: 'Payment Gateway Stripe webhook latency spike > 500ms',
    severity: 'SEV-2',
    status: 'INVESTIGATING',
    affectedService: 'payment-service',
    timeAgo: '8m ago',
  },
];

const INITIAL_ACTIVITIES = [
  {
    id: 'act-1',
    developerName: 'alex-dev',
    actionType: 'COMMIT',
    repository: 'devpulse/backend',
    message: 'Optimize Redis connection pooling & Jedis buffer sizes',
    timeAgo: '3m ago',
  },
  {
    id: 'act-2',
    developerName: 'sarah-ops',
    actionType: 'PR_MERGED',
    repository: 'devpulse/infra',
    message: 'Bump Kubernetes ingress replicas for canary rollout',
    timeAgo: '14m ago',
  },
  {
    id: 'act-3',
    developerName: 'marcus-fin',
    actionType: 'CODE_REVIEW',
    repository: 'devpulse/payment-service',
    message: 'Approved pull request #84: add idempotency header verification',
    timeAgo: '28m ago',
  },
];

export default function App() {
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [builds, setBuilds] = useState(INITIAL_BUILDS);
  const [deployments, setDeployments] = useState(INITIAL_DEPLOYMENTS);
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [selectedEnv, setSelectedEnv] = useState('production');
  const [autoSimulate, setAutoSimulate] = useState(true);
  const [latencyHistory, setLatencyHistory] = useState([
    { time: '01:00', gateway: 24, auth: 18, payment: 65 },
    { time: '01:05', gateway: 26, auth: 20, payment: 72 },
    { time: '01:10', gateway: 22, auth: 17, payment: 88 },
    { time: '01:15', gateway: 25, auth: 19, payment: 82 },
    { time: '01:20', gateway: 24, auth: 18, payment: 85 },
  ]);

  // Handle incoming STOMP WebSocket events
  const handleWebSocketEvent = useCallback((type, data) => {
    switch (type) {
      case 'metrics':
        setMetrics((prev) => ({ ...prev, ...data }));
        break;
      case 'build':
        setBuilds((prev) => [data, ...prev.filter((b) => b.id !== data.id)].slice(0, 10));
        break;
      case 'deployment':
        setDeployments((prev) => [data, ...prev.filter((d) => d.id !== data.id)].slice(0, 10));
        break;
      case 'health':
        if (data.services) setServices(data.services);
        if (data.historyPoint) {
          setLatencyHistory((prev) => [...prev.slice(1), data.historyPoint]);
        }
        break;
      case 'incident':
        setIncidents((prev) => {
          const filtered = prev.filter((i) => i.id !== data.id);
          return [data, ...filtered];
        });
        break;
      case 'activity':
        setActivities((prev) => [data, ...prev].slice(0, 12));
        break;
      default:
        break;
    }
  }, []);

  const { connectionStatus, redisStatus } = useWebSocket(handleWebSocketEvent);

  // Background Autonomous Simulator (generates smooth living telemetry pulses)
  useEffect(() => {
    if (!autoSimulate) return;

    const interval = setInterval(() => {
      // Fluctuate latencies smoothly
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const gw = Math.floor(20 + Math.random() * 12);
      const au = Math.floor(15 + Math.random() * 8);
      const pay = Math.floor(40 + Math.random() * 35);

      setLatencyHistory((prev) => [
        ...prev.slice(1),
        { time: timeStr, gateway: gw, auth: au, payment: pay },
      ]);

      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          latencyMs:
            s.name === 'api-gateway'
              ? gw
              : s.name === 'auth-service'
              ? au
              : s.name === 'payment-service'
              ? pay
              : Math.floor(12 + Math.random() * 20),
        }))
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [autoSimulate]);

  // Interactive Simulation triggers
  const handleSimulate = async (type, payload = {}) => {
    // Notify backend if connected
    triggerSimulationEvent(type, payload);

    // Apply immediate optimistic updates to UI
    const now = new Date();
    const timeStr = 'Just now';

    if (type === 'DEPLOY') {
      const services = ['api-gateway', 'auth-service', 'payment-service', 'order-processing', 'notification-service'];
      const chosenService = services[Math.floor(Math.random() * services.length)];
      const newDeploy = {
        id: `d-${Date.now()}`,
        serviceName: chosenService,
        environment: payload.environment || selectedEnv,
        version: `2.${Math.floor(Math.random() * 5) + 4}.${Math.floor(Math.random() * 9)}`,
        deployedBy: 'you (demo)',
        commitHash: Math.random().toString(36).substring(2, 9),
        status: 'IN_PROGRESS',
        timeAgo: timeStr,
      };
      setDeployments((prev) => [newDeploy, ...prev]);
      setMetrics((prev) => ({ ...prev, deploysToday: prev.deploysToday + 1 }));

      // Complete deployment after 3s
      setTimeout(() => {
        setDeployments((prev) =>
          prev.map((d) => (d.id === newDeploy.id ? { ...d, status: 'DEPLOYED' } : d))
        );
      }, 3000);
    } else if (type === 'BUILD' || type === 'BUILD_SUCCESS' || type === 'BUILD_FAILURE') {
      const isFail = type === 'BUILD_FAILURE';
      const newBuild = {
        id: `b-${Date.now()}`,
        pipelineName: isFail ? 'payment-e2e-suite' : 'core-services-pipeline',
        source: Math.random() > 0.5 ? 'GITHUB' : 'JENKINS',
        buildNumber: String(Math.floor(Math.random() * 500) + 100),
        branch: isFail ? 'fix/checkout-bug' : 'feature/redis-pubsub',
        commitHash: Math.random().toString(36).substring(2, 9),
        author: 'alex-dev',
        status: isFail ? 'FAILED' : 'SUCCESS',
        durationSeconds: Math.floor(Math.random() * 60) + 30,
      };
      setBuilds((prev) => [newBuild, ...prev]);
      setMetrics((prev) => ({
        ...prev,
        totalBuilds24h: prev.totalBuilds24h + 1,
        failedBuilds24h: isFail ? prev.failedBuilds24h + 1 : prev.failedBuilds24h,
        buildSuccessRate: ((prev.totalBuilds24h + 1 - (isFail ? prev.failedBuilds24h + 1 : prev.failedBuilds24h)) / (prev.totalBuilds24h + 1)) * 100,
      }));
    } else if (type === 'INCIDENT') {
      const newIncident = {
        id: `inc-${Date.now()}`,
        title: 'Redis Cluster memory saturation threshold exceeded (> 85%)',
        severity: payload.severity || 'SEV-1',
        status: 'OPEN',
        affectedService: 'order-processing',
        timeAgo: timeStr,
      };
      setIncidents((prev) => [newIncident, ...prev]);
      setMetrics((prev) => ({ ...prev, activeIncidents: prev.activeIncidents + 1 }));
    } else if (type === 'ACTIVITY') {
      const devs = ['alex-dev', 'sarah-ops', 'marcus-fin', 'elena-code'];
      const repos = ['devpulse/gateway', 'devpulse/auth', 'devpulse/redis-worker'];
      const msgs = [
        'Merged pull request #92: switch STOMP over SockJS fallback',
        'Add Prometheus metrics endpoint and Grafana scrape configs',
        'Refactor Redis caching keys for developer activity stream',
        'Fix Docker multi-stage build cache invalidation',
      ];
      const newActivity = {
        id: `act-${Date.now()}`,
        developerName: devs[Math.floor(Math.random() * devs.length)],
        actionType: 'COMMIT',
        repository: repos[Math.floor(Math.random() * repos.length)],
        message: msgs[Math.floor(Math.random() * msgs.length)],
        timeAgo: timeStr,
      };
      setActivities((prev) => [newActivity, ...prev]);
    } else if (type === 'LATENCY_SPIKE') {
      setServices((prev) =>
        prev.map((s) => (s.name === 'payment-service' ? { ...s, latencyMs: 420, status: 'DOWN' } : s))
      );
      setTimeout(() => {
        setServices((prev) =>
          prev.map((s) => (s.name === 'payment-service' ? { ...s, latencyMs: 65, status: 'HEALTHY' } : s))
        );
      }, 5000);
    }
  };

  const handleResolveIncident = (id) => {
    resolveIncident(id);
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: 'RESOLVED' } : inc))
    );
    setMetrics((prev) => ({
      ...prev,
      activeIncidents: Math.max(0, prev.activeIncidents - 1),
    }));
  };

  const handleAcknowledgeIncident = (id) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: 'ACKNOWLEDGED' } : inc))
    );
  };

  const handleRollback = (deployId) => {
    setDeployments((prev) =>
      prev.map((d) => (d.id === deployId ? { ...d, status: 'ROLLED_BACK' } : d))
    );
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        connectionStatus={connectionStatus}
        redisStatus={redisStatus}
        onSimulate={handleSimulate}
        autoSimulate={autoSimulate}
        setAutoSimulate={setAutoSimulate}
        selectedEnv={selectedEnv}
        setSelectedEnv={setSelectedEnv}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-[1700px] w-full mx-auto space-y-6">
        {/* Top KPIs */}
        <MetricCards metrics={metrics} />

        {/* Interactive Simulation Strip */}
        <SimulationControls onSimulate={handleSimulate} />

        {/* Two Column Grid: Pipeline Stream & Deployments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PipelineStream builds={builds} />
          <DeploymentTimeline deployments={deployments} onRollback={handleRollback} />
        </div>

        {/* Two Column Grid: API Health & Incidents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ApiHealthGrid services={services} latencyHistory={latencyHistory} />
          <IncidentCenter
            incidents={incidents}
            onResolveIncident={handleResolveIncident}
            onAcknowledgeIncident={handleAcknowledgeIncident}
          />
        </div>

        {/* Developer Activity Feed */}
        <DeveloperActivityFeed activities={activities} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-500 font-mono">
        DevPulse — Engineering Intelligence Platform · Stack: React 19 + Spring Boot 3 + Redis + WebSocket + CI/CD
      </footer>
    </div>
  );
}
