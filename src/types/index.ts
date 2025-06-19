export interface ObjaxField {
  name: string
  default?: any
}

export interface ObjaxMethod {
  name: string
  code: string
}

export interface ObjaxClass {
  name: string
  code: string
  fields: ObjaxField[]
  methods: ObjaxMethod[]
}

export interface ObjaxPage {
  name: string
}

export interface StateHistoryEntry {
  date: string
  [key: string]: any
}

export interface ObjaxState {
  name: string
  history: StateHistoryEntry[]
}

export interface ObjaxInstance {
  name: string
  label?: string
  color?: string
  width?: string
  onChange?: string
  onClick?: string
  page: string
  type: 'ButtonMorph' | 'FieldMorph' | 'ListMorph' | 'GroupMorph'
}

export interface ObjaxProject {
  pages: ObjaxPage[]
  states: ObjaxState[]
  instances: ObjaxInstance[]
  classes: ObjaxClass[]
}