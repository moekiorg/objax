import type { ObjaxClass } from '../types';

// Preset UI Morph classes that are always available
export const presetUIClasses: ObjaxClass[] = [
  {
    name: 'ButtonMorph',
    code: 'define ButtonMorph\nButtonMorph has field "label"\nButtonMorph has field "onClick"',
    fields: [
      { name: 'label', default: 'ボタン' },
      { name: 'onClick', default: '' }
    ],
    methods: []
  },
  {
    name: 'FieldMorph',
    code: 'define FieldMorph\nFieldMorph has field "label"\nFieldMorph has field "value"\nFieldMorph has method "add" do set field "value" of myself to concatenate field "value" of myself with parameter',
    fields: [
      { name: 'label', default: 'フィールド' },
      { name: 'value', default: '' },
      { name: 'type', default: 'text' }
    ],
    methods: [
      { name: 'add', code: 'set field "value" of myself to parameter' }
    ]
  },
  {
    name: 'ListMorph',
    code: 'define ListMorph\nListMorph has field "label"\nListMorph has field "items"',
    fields: [
      { name: 'label', default: 'リスト' },
      { name: 'items', default: [] }
    ],
    methods: []
  },
  {
    name: 'GroupMorph',
    code: 'define GroupMorph\nGroupMorph has field "label"\nGroupMorph has field "children"',
    fields: [
      { name: 'label', default: 'グループ' },
      { name: 'children', default: [] },
      { name: 'flexDirection', default: 'column' },
      { name: 'alignItems', default: 'stretch' },
      { name: 'justifyContent', default: 'flex-start' },
      { name: 'gap', default: '8px' },
      { name: 'padding', default: '12px' }
    ],
    methods: []
  },
  {
    name: 'DatabaseMorph',
    code: 'define DatabaseMorph\nDatabaseMorph has field "label"\nDatabaseMorph has field "dataSource"',
    fields: [
      { name: 'label', default: 'データベース' },
      { name: 'dataSource', default: '' },
      { name: 'viewMode', default: 'table' },
      { name: 'columns', default: [] }
    ],
    methods: []
  },
  {
    name: 'State',
    code: 'define State\nState has field "name"\nState has field "value"\nState has method "set" do set field "value" of myself to parameter\nState has method "get" do return field "value" of myself',
    fields: [
      { name: 'name', default: '' },
      { name: 'value', default: null }
    ],
    methods: [
      { name: 'set', code: 'set field "value" of myself to parameter' },
      { name: 'get', code: 'return field "value" of myself' }
    ]
  }
];