import type { Meta, StoryObj } from '@storybook/react';
import { Map, MapMarker, MapRoute, MapRegionDatum, MapBubble } from './Map';

const meta: Meta<typeof Map> = {
  title: 'Data Visualization/Map',
  component: Map,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Primary title for map header',
    },
    subtitle: {
      control: 'text',
      description: 'Monospace metadata subtitle',
    },
    height: {
      control: { type: 'range', min: 380, max: 760, step: 20 },
      description: 'Canvas height in pixels',
    },
    colorScale: {
      control: 'select',
      options: ['editorial', 'stone', 'amber', 'emerald', 'azure', 'crimson'],
      description: 'Thematic color ramp for choropleth data',
    },
    initialPreset: {
      control: 'select',
      options: [
        'world',
        'north-america',
        'south-america',
        'europe',
        'asia-pacific',
        'africa',
        'oceania',
        'middle-east',
      ],
      description: 'Default camera viewport preset',
    },
    showGraticule: {
      control: 'boolean',
      description: 'Toggles meridians and parallels coordinate grid',
    },
    showControls: {
      control: 'boolean',
      description: 'Toggles floating zoom and preset controls',
    },
    showTelemetry: {
      control: 'boolean',
      description: 'Toggles bottom status bar with real-time cursor GPS',
    },
    showLegend: {
      control: 'boolean',
      description: 'Toggles choropleth value spectrum bar',
    },
    showCompass: {
      control: 'boolean',
      description: 'Toggles true-north compass indicator',
    },
    interactive: {
      control: 'boolean',
      description: 'Enables mouse drag pan and scroll wheel zoom',
    },
    onRegionClick: { action: 'regionClicked' },
    onMarkerClick: { action: 'markerClicked' },
    onRouteClick: { action: 'routeClicked' },
    onViewportChange: { action: 'viewportChanged' },
  },
};

export default meta;
type Story = StoryObj<typeof Map>;

// Sample Global Hub Markers
const SAMPLE_MARKERS: MapMarker[] = [
  {
    id: 'nyc',
    label: 'New York (US-EAST)',
    lat: 40.7128,
    lng: -74.006,
    category: 'PRIMARY HUB',
    value: '99.99% UPTIME',
    color: '#1C1917',
    pulse: true,
  },
  {
    id: 'sfo',
    label: 'San Francisco (US-WEST)',
    lat: 37.7749,
    lng: -122.4194,
    category: 'EDGE NODE',
    value: '1.2M REQ/S',
    color: '#78716C',
    pulse: true,
  },
  {
    id: 'lon',
    label: 'London (EU-WEST)',
    lat: 51.5074,
    lng: -0.1278,
    category: 'PRIMARY HUB',
    value: '12ms LATENCY',
    color: '#1C1917',
    pulse: true,
  },
  {
    id: 'fra',
    label: 'Frankfurt (EU-CENTRAL)',
    lat: 50.1109,
    lng: 8.6821,
    category: 'DATA VAULT',
    value: '4.8 PB STORED',
    color: '#78716C',
  },
  {
    id: 'tok',
    label: 'Tokyo (AP-NORTHEAST)',
    lat: 35.6762,
    lng: 139.6503,
    category: 'PRIMARY HUB',
    value: '99.98% UPTIME',
    color: '#1C1917',
    pulse: true,
  },
  {
    id: 'sin',
    label: 'Singapore (AP-SOUTHEAST)',
    lat: 1.3521,
    lng: 103.8198,
    category: 'GATEWAY',
    value: '840k REQ/S',
    color: '#78716C',
    pulse: true,
  },
  {
    id: 'syd',
    label: 'Sydney (AP-SOUTHEAST-2)',
    lat: -33.8688,
    lng: 151.2093,
    category: 'EDGE NODE',
    value: '32ms LATENCY',
    color: '#78716C',
  },
  {
    id: 'sao',
    label: 'São Paulo (SA-EAST)',
    lat: -23.5505,
    lng: -46.6333,
    category: 'EDGE NODE',
    value: '450k REQ/S',
    color: '#A8A29E',
  },
  {
    id: 'cpt',
    label: 'Cape Town (AF-SOUTH)',
    lat: -33.9249,
    lng: 18.4241,
    category: 'RELAY',
    value: '180k REQ/S',
    color: '#A8A29E',
  },
];

// Sample Transcontinental Flight / Fiber Routes
const SAMPLE_ROUTES: MapRoute[] = [
  {
    id: 'lon-nyc',
    from: { lat: 51.5074, lng: -0.1278, label: 'London' },
    to: { lat: 40.7128, lng: -74.006, label: 'New York' },
    label: 'Transatlantic Trunk (TAT-14)',
    value: '38 ms • 100 Gbps',
    color: '#78716C',
    width: 2,
    animated: true,
  },
  {
    id: 'nyc-sfo',
    from: { lat: 40.7128, lng: -74.006, label: 'New York' },
    to: { lat: 37.7749, lng: -122.4194, label: 'San Francisco' },
    label: 'Transcontinental US Backbone',
    value: '42 ms • 200 Gbps',
    color: '#A8A29E',
    width: 1.5,
    animated: true,
  },
  {
    id: 'sfo-tok',
    from: { lat: 37.7749, lng: -122.4194, label: 'San Francisco' },
    to: { lat: 35.6762, lng: 139.6503, label: 'Tokyo' },
    label: 'Transpacific Unity Cable',
    value: '84 ms • 80 Gbps',
    color: '#78716C',
    width: 2,
    animated: true,
  },
  {
    id: 'lon-dxb',
    from: { lat: 51.5074, lng: -0.1278, label: 'London' },
    to: { lat: 25.2048, lng: 55.2708, label: 'Dubai' },
    label: 'Euro-Gulf Transit Link',
    value: '64 ms • 60 Gbps',
    color: '#A8A29E',
    width: 1.5,
    animated: true,
  },
  {
    id: 'tok-sin',
    from: { lat: 35.6762, lng: 139.6503, label: 'Tokyo' },
    to: { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
    label: 'ASEAN Marine Highway',
    value: '35 ms • 120 Gbps',
    color: '#78716C',
    width: 2,
    animated: true,
  },
  {
    id: 'sin-syd',
    from: { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
    to: { lat: -33.8688, lng: 151.2093, label: 'Sydney' },
    label: 'Indigo-West Cable',
    value: '58 ms • 40 Gbps',
    color: '#A8A29E',
    width: 1.5,
    animated: true,
  },
];

// Sample Choropleth Activity Data
const SAMPLE_CHOROPLETH: MapRegionDatum[] = [
  { id: 'na-usa', code: 'US', value: 94200, label: 'Active Readers' },
  { id: 'na-canada', code: 'CA', value: 41800, label: 'Active Readers' },
  { id: 'eu-west', code: 'WE', value: 83500, label: 'Active Readers' },
  { id: 'eu-british-isles', code: 'GB', value: 58900, label: 'Active Readers' },
  { id: 'eu-nordics', code: 'NO', value: 31200, label: 'Active Readers' },
  { id: 'eu-east', code: 'EE', value: 44000, label: 'Active Readers' },
  { id: 'as-east-china', code: 'CN', value: 98700, label: 'Active Readers' },
  { id: 'as-south-india', code: 'IN', value: 87400, label: 'Active Readers' },
  { id: 'as-japan-korea', code: 'JP', value: 65100, label: 'Active Readers' },
  { id: 'as-southeast', code: 'SEA', value: 52000, label: 'Active Readers' },
  { id: 'sa-brazil', code: 'BR', value: 49800, label: 'Active Readers' },
  { id: 'oc-australia', code: 'AU', value: 36400, label: 'Active Readers' },
  { id: 'af-north', code: 'NAF', value: 24500, label: 'Active Readers' },
  { id: 'af-south', code: 'SAF', value: 18200, label: 'Active Readers' },
];

// Sample Density Bubbles
const SAMPLE_BUBBLES: MapBubble[] = [
  { id: 'b1', label: 'Tokyo-Yokohama Metro', lat: 35.6762, lng: 139.6503, value: 37400000 },
  { id: 'b2', label: 'Delhi National Capital', lat: 28.6139, lng: 77.209, value: 30200000 },
  { id: 'b3', label: 'Shanghai Mega-cluster', lat: 31.2304, lng: 121.4737, value: 27000000 },
  { id: 'b4', label: 'São Paulo Urban Area', lat: -23.5505, lng: -46.6333, value: 22000000 },
  { id: 'b5', label: 'New York Tri-State', lat: 40.7128, lng: -74.006, value: 20100000 },
  { id: 'b6', label: 'Greater London Area', lat: 51.5074, lng: -0.1278, value: 14200000 },
  { id: 'b7', label: 'Cairo Governorate', lat: 30.0444, lng: 31.2357, value: 20400000 },
];

export const WorldOverview: Story = {
  args: {
    title: 'Global Telemetry Map',
    subtitle: 'WGS 84 • EQUIRECTANGULAR PROJECTION • 0PX CARTOGRAPHIC GEOMETRY',
    height: 540,
    initialPreset: 'world',
    showGraticule: true,
    showControls: true,
    showTelemetry: true,
    showCompass: true,
    interactive: true,
  },
  render: (args) => (
    <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto' }}>
      <Map {...args} />
    </div>
  ),
};

export const ChoroplethAnalytics: Story = {
  args: {
    title: 'Global Readership Distribution',
    subtitle: 'THEMATIC CHOROPLETH HEAT SCALE • ACTIVE SCHOLAR VOLUME',
    height: 540,
    regionsData: SAMPLE_CHOROPLETH,
    colorScale: 'editorial',
    showLegend: true,
    showGraticule: true,
    showControls: true,
    showTelemetry: true,
    initialPreset: 'world',
  },
  render: (args) => (
    <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto' }}>
      <Map {...args} />
    </div>
  ),
};

export const GlobalFlightAndFiberRoutes: Story = {
  args: {
    title: 'Global Transit & Data Backbone',
    subtitle: 'SUBMARINE CABLES & INTERCONTINENTAL PACKET ROUTES',
    height: 540,
    markers: SAMPLE_MARKERS,
    routes: SAMPLE_ROUTES,
    showGraticule: true,
    showControls: true,
    showTelemetry: true,
    initialPreset: 'world',
  },
  render: (args) => (
    <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto' }}>
      <Map {...args} />
    </div>
  ),
};

export const HubsAndBeacons: Story = {
  args: {
    title: 'Cloud Edge Nodes & Datacenters',
    subtitle: 'PULSING BEACON PINS • REAL-TIME LAT/LNG TRACKING',
    height: 540,
    markers: SAMPLE_MARKERS,
    showGraticule: true,
    showControls: true,
    showTelemetry: true,
    initialPreset: 'world',
  },
  render: (args) => (
    <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto' }}>
      <Map {...args} />
    </div>
  ),
};

export const DensityBubbles: Story = {
  args: {
    title: 'Metropolitan Population Clusters',
    subtitle: 'PROPORTIONAL GRADUATED GEOGRAPHIC RECTANGLES',
    height: 540,
    bubbles: SAMPLE_BUBBLES,
    showGraticule: true,
    showControls: true,
    showTelemetry: true,
    initialPreset: 'world',
  },
  render: (args) => (
    <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto' }}>
      <Map {...args} />
    </div>
  ),
};

export const RegionalFocusEurope: Story = {
  args: {
    title: 'European Infrastructure Mesh',
    subtitle: 'REGIONAL VIEWPORT • 3.40X OPTICAL ZOOM',
    height: 540,
    initialPreset: 'europe',
    markers: SAMPLE_MARKERS.filter((m) => ['lon', 'fra', 'par', 'ber'].includes(m.id)),
    routes: SAMPLE_ROUTES.filter((r) => r.id.startsWith('lon')),
    showGraticule: true,
    showControls: true,
    showTelemetry: true,
  },
  render: (args) => (
    <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto' }}>
      <Map {...args} />
    </div>
  ),
};

export const EmeraldColorScaleChoropleth: Story = {
  args: {
    title: 'Renewable Grid Adoption by Territory',
    subtitle: 'CALM EMERALD PALETTE • PERCENTAGE OF ENERGY FROM HYDRO & SOLAR',
    height: 540,
    regionsData: SAMPLE_CHOROPLETH,
    colorScale: 'emerald',
    showLegend: true,
    showGraticule: true,
    showControls: true,
    showTelemetry: true,
  },
  render: (args) => (
    <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto' }}>
      <Map {...args} />
    </div>
  ),
};
