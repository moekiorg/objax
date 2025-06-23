export interface ObjaxField {
  name: string;
  default?: any;
}

export interface ObjaxMethod {
  name: string;
  code: string;
}

export interface ObjaxClass {
  name: string;
  code: string;
  fields: ObjaxField[];
  methods: ObjaxMethod[];
}

export interface ObjaxPage {
  name: string;
}

export interface StateHistoryEntry {
  date: string;
  [key: string]: any;
}

export interface ObjaxState {
  name: string;
  history: StateHistoryEntry[];
}

export interface ObjaxInstance {
  id: string;
  name: string;
  className: string;
  label?: string;
  color?: string;
  width?: string;
  height?: string;
  onChange?: string;
  onClick?: string;
  page: string;
  type?: 'ButtonMorph' | 'FieldMorph' | 'ListMorph' | 'GroupMorph' | 'DatabaseMorph' | 'BoxMorph' | 'Timer';
  value?: string | number | boolean;
  items?: string[];
  children?: string[];
  parentId?: string;
  order?: number;
  isOpen?: boolean; // For controlling visibility of custom class instances
  // Layout properties for GroupMorph
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: string;
  padding?: string;
  // DatabaseMorph properties
  dataSource?: string; // Reference to instance name
  viewMode?: 'table' | 'grid';
  columns?: string[]; // Field names to display
  fields?: string[]; // Fields to display for DatabaseMorph (alternative naming for user convenience)
  // Event listeners
  eventListeners?: Array<{
    eventType: 'click' | 'change' | 'input' | 'submit';
    action: string;
  }>;
  // Timer properties
  time?: number; // Timer interval in milliseconds
  action?: string; // Timer action code
  isRunning?: boolean; // Timer running state
  intervalId?: number; // Internal interval ID for cleanup
  // BoxMorph properties
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  margin?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
  display?: string;
  position?: string;
  opacity?: string;
  boxShadow?: string;
  // Additional properties
  properties?: Record<string, any>;
}

export interface ObjaxProject {
  pages: ObjaxPage[];
  states: ObjaxState[];
  instances: ObjaxInstance[];
  classes: ObjaxClass[];
}

export interface HistoryState {
  instances: ObjaxInstance[];
  timestamp: number;
}
