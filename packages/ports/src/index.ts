// Ports of every project's frontend and backend; the Docker compose files repeat these numbers
export const PORTS = {
  home: { frontend: 3000 },
  auth: { backend: 3001 },
  linkShortener: { frontend: 3004, backend: 3012 },
  imageUpload: { frontend: 3005, backend: 3006 },
  aiSummary: { frontend: 3007, backend: 3008 },
  chatbot: { frontend: 3009, backend: 3010 },
  invoices: { frontend: 3014, backend: 3013 },
} as const;

export type ProjectName = keyof typeof PORTS;
export type ProjectSide<P extends ProjectName> = keyof (typeof PORTS)[P];
// Projects that have a backend (the `api` a frontend proxies to)
export type BackendProject = { [P in ProjectName]: "backend" extends ProjectSide<P> ? P : never }[ProjectName];

type PerSide = { [P in ProjectName]: Record<ProjectSide<P>, string> };

// Path of each service once deployed behind one HTTPS domain, e.g. https://myapp.com/invoices
export const APP_PATHS: PerSide = {
  home: { frontend: "/" },
  auth: { backend: "/auth" },
  linkShortener: { frontend: "/links", backend: "/links-api" },
  imageUpload: { frontend: "/images", backend: "/images-api" },
  aiSummary: { frontend: "/summaries", backend: "/summaries-api" },
  chatbot: { frontend: "/chatbot", backend: "/chatbot-api" },
  invoices: { frontend: "/invoices", backend: "/invoices-api" },
};

// Host name label of each service when deployed on subdomains (invoices.example.com); see kubernetes/
export const APP_SUBDOMAINS: PerSide = {
  home: { frontend: "home" },
  auth: { backend: "auth" },
  linkShortener: { frontend: "links", backend: "links-api" },
  imageUpload: { frontend: "images", backend: "images-api" },
  aiSummary: { frontend: "summary", backend: "summary-api" },
  chatbot: { frontend: "chatbot", backend: "chatbot-api" },
  invoices: { frontend: "invoices", backend: "invoices-api" },
};

// The parent domain when the page runs on one of APP_SUBDOMAINS (invoices.example.com → example.com), else null
export const deployedDomain = (): string | null => {
  if (typeof window === "undefined") return null;
  const [firstLabel, ...rest] = window.location.hostname.split(".");
  const subdomains: string[] = Object.values(APP_SUBDOMAINS).flatMap((sides) => Object.values(sides));
  const isAppSubdomain = subdomains.includes(firstLabel);
  return isAppSubdomain && rest.length >= 2 ? rest.join(".") : null;
};

export const LOCALHOST = "localhost";

// Host the page was opened from (localhost, a LAN IP such as 192.168.0.1, ...); localhost outside a browser
export const currentHostname = (): string =>
  typeof window === "undefined" ? LOCALHOST : window.location.hostname || LOCALHOST;

// Deployed: the page is on an HTTPS domain without a port (https://myapp.com/...); local dev uses host:port
export const isDeployed = (): boolean =>
  typeof window !== "undefined" && window.location.protocol === "https:" && window.location.port === "";

type ServiceUrlOptions = { hostname?: string; protocol?: "http" | "https" };

// Local: http://<current host>:<port> (localhost or a LAN IP). Deployed: <current origin><app path>.
// An explicit hostname/protocol (server-side configs) always gives host:port.
export const serviceUrl = <P extends ProjectName>(
  project: P,
  side: ProjectSide<P>,
  { hostname, protocol }: ServiceUrlOptions = {},
) => {
  const domain = hostname || protocol ? null : deployedDomain();
  if (domain) {
    const port = window.location.port ? `:${window.location.port}` : "";
    return `${window.location.protocol}//${APP_SUBDOMAINS[project][side]}.${domain}${port}`;
  }
  if (!hostname && !protocol && isDeployed()) return `${window.location.origin}${APP_PATHS[project][side]}`;
  return `${protocol ?? "http"}://${hostname ?? currentHostname()}:${String(PORTS[project][side])}`;
};

// Origins of the web apps on localhost, the default CORS allow-list of the APIs
export const localAppOrigins = (): string[] =>
  (["home", "linkShortener", "imageUpload", "aiSummary", "chatbot", "invoices"] as const).flatMap((project) => [
    serviceUrl(project, "frontend", { hostname: LOCALHOST }),
    serviceUrl(project, "frontend", { hostname: LOCALHOST, protocol: "https" }),
  ]);
