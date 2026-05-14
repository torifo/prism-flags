export const TOOLS = [
  { id: 'git',     label: 'Git',     color: '#f05033' },
  { id: 'docker',  label: 'Docker',  color: '#2496ed' },
  { id: 'npm',     label: 'npm',     color: '#cb3837' },
  { id: 'curl',    label: 'curl',    color: '#073551' },
  { id: 'kubectl', label: 'kubectl', color: '#326ce5' },
  { id: 'python',  label: 'Python',  color: '#3776ab' },
  { id: 'cargo',   label: 'Cargo',   color: '#dea584' },
  { id: 'sed',     label: 'sed',     color: '#4b5563' },
] as const;

export type ToolId = (typeof TOOLS)[number]['id'];
