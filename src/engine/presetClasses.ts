import type { ObjaxClass } from '../types';

// Preset UI Morph classes that are always available
export const presetUIClasses: ObjaxClass[] = [
  {
    name: 'ButtonMorph',
    code: 'ButtonMorph is a Class\nButtonMorph has field "label"\nButtonMorph has field "onClick"',
    fields: [
      { name: 'label', default: 'ボタン' },
      { name: 'onClick', default: '' }
    ],
    methods: []
  },
  {
    name: 'FieldMorph',
    code: 'FieldMorph is a Class\nFieldMorph has field "label"\nFieldMorph has field "value"\nFieldMorph has method "add" do self.value is parameter',
    fields: [
      { name: 'label', default: 'フィールド' },
      { name: 'value', default: '' },
      { name: 'type', default: 'text' }
    ],
    methods: [
      { name: 'add', code: 'self.value is parameter' }
    ]
  },
  {
    name: 'ListMorph',
    code: 'ListMorph is a Class\nListMorph has field "label"\nListMorph has field "items"',
    fields: [
      { name: 'label', default: 'リスト' },
      { name: 'items', default: [] }
    ],
    methods: []
  },
  {
    name: 'GroupMorph',
    code: 'GroupMorph is a Class\nGroupMorph has field "label"\nGroupMorph has field "children"',
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
    code: 'DatabaseMorph is a Class\nDatabaseMorph has field "label"\nDatabaseMorph has field "source"',
    fields: [
      { name: 'label', default: 'データベース' },
      { name: 'source', default: '' },
      { name: 'viewMode', default: 'table' },
      { name: 'columns', default: [] }
    ],
    methods: []
  },
  {
    name: 'BoxMorph',
    code: 'BoxMorph is a Class\nBoxMorph has field "label"',
    fields: [
      { name: 'label', default: 'ボックス' },
      { name: 'width', default: 100 },
      { name: 'height', default: 50 },
      { name: 'backgroundColor', default: '#ffffff' },
      { name: 'borderColor', default: '#cccccc' },
      { name: 'borderWidth', default: '1px' },
      { name: 'borderRadius', default: '4px' },
      { name: 'padding', default: '12px' },
      { name: 'margin', default: '0px' },
      { name: 'textColor', default: '#000000' },
      { name: 'fontSize', default: '14px' },
      { name: 'fontWeight', default: 'normal' },
      { name: 'textAlign', default: 'left' },
      { name: 'display', default: 'block' },
      { name: 'position', default: 'static' },
      { name: 'opacity', default: '1' },
      { name: 'boxShadow', default: 'none' }
    ],
    methods: []
  },
  {
    name: 'List',
    code: 'List is a Class\nList has field "items"\nList has method "add" with "item" do self.items is self.items + [item]\nList has method "remove" with "item" do self.items is self.items - [item]\nList has method "size" do return size of self.items',
    fields: [
      { name: 'items', default: [] }
    ],
    methods: [
      { name: 'add', code: 'self.items is self.items + [item]' },
      { name: 'remove', code: 'self.items is self.items - [item]' },
      { name: 'size', code: 'return size of self.items' }
    ]
  },
  {
    name: 'State',
    code: 'State is a Class\nState has field "name"\nState has field "value"\nState has method "set" do self.value is parameter\nState has method "get" do return field "value" of myself',
    fields: [
      { name: 'name', default: '' },
      { name: 'value', default: null }
    ],
    methods: [
      { name: 'set', code: 'self.value is parameter' },
      { name: 'get', code: 'return field "value" of myself' }
    ]
  },
  {
    name: 'World',
    code: 'World is a Class\nWorld has field "currentPage"\nWorld has method "goto" with "page" do self.currentPage is page',
    fields: [
      { name: 'currentPage', default: '' }
    ],
    methods: [
      { name: 'goto', code: 'self.currentPage is page' }
    ]
  },
  {
    name: 'Timer',
    code: 'Timer is a Class\nTimer has field "time"\nTimer has field "action"\nTimer has field "isRunning"',
    fields: [
      { name: 'time', default: 1000 },
      { name: 'action', default: '' },
      { name: 'isRunning', default: false }
    ],
    methods: []
  },
  {
    name: 'DataMorph',
    code: 'DataMorph is a Class\nDataMorph has field "label"\nDataMorph has field "record"\nDataMorph has field "displayFields"',
    fields: [
      { name: 'label', default: 'データ' },
      { name: 'record', default: {} },
      { name: 'displayFields', default: [] }
    ],
    methods: []
  }
];