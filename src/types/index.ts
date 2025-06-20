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
  onChange?: string;
  onClick?: string;
  page: string;
  type?: 'ButtonMorph' | 'FieldMorph' | 'ListMorph' | 'GroupMorph' | 'DatabaseMorph';
  value?: string | number | boolean;
  items?: string[];
  children?: string[];
  parentId?: string;
  order?: number;
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
