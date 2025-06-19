# 線形パーサーアプローチの分析

## 現在の問題

Chevrotainのような高度なパーサーライブラリは：
- **複雑すぎる**: Objax言語はシンプルな構文
- **文脈依存の処理が困難**: クラス定義中の状態管理が難しい
- **デバッグが困難**: パーサーエラーの原因特定が複雑

## 線形パーサーのメリット

### 1. **シンプルな状態管理**
```javascript
class LinearObjaxParser {
  private currentClass: ObjaxClass | null = null
  private classes: Map<string, ObjaxClass> = new Map()
  private instances: ObjaxInstance[] = []
  
  parseLine(line: string) {
    if (line.startsWith('define ')) {
      this.handleClassDefinition(line)
    } else if (this.currentClass && line.includes(' has field ')) {
      this.handleFieldDefinition(line)
    } else if (line.includes(' is a new ')) {
      this.handleInstanceCreation(line)
    }
  }
}
```

### 2. **文脈認識が自然**
- クラス定義中なら `currentClass` にフィールド/メソッドを追加
- トップレベルならインスタンス作成やその他の文を処理
- 状態遷移が明確

### 3. **エラーハンドリングが簡単**
```javascript
if (!this.currentClass && line.includes(' has field ')) {
  throw new Error('Field definition outside class at line: ' + line)
}
```

### 4. **拡張しやすい**
新しい構文を追加するときも、単純にif文を追加するだけ

## Objax言語の特性に適している理由

### **行指向の構文**
```objax
define Task                    // 1行で完結
Task has field "title"         // 1行で完結  
Task has method "do" do ...    // 1行で完結
myTask is a new Task           // 1行で完結
```

### **明確な文脈**
- `define` で始まる → クラス定義開始
- クラス名 + `has` → クラスメンバー定義
- 変数名 + `is a new` → インスタンス作成

### **状態依存**
- クラス定義中かどうかでパースルールが変わる
- これは線形パーサーが得意とする領域

## 実装案

### トークナイザー（軽量）
```javascript
function tokenize(line: string): Token[] {
  return line.split(/\s+/)
    .map(word => ({ type: getTokenType(word), value: word }))
}

function getTokenType(word: string): TokenType {
  if (word === 'define') return 'DEFINE'
  if (word === 'has') return 'HAS'
  if (word.startsWith('"') && word.endsWith('"')) return 'STRING'
  // ...
}
```

### 線形パーサー
```javascript
class LinearObjaxParser {
  parse(code: string): ObjaxExecutionResult {
    const lines = code.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      const tokens = tokenize(line.trim())
      this.parseLine(tokens)
    }
    
    return this.buildResult()
  }
  
  private parseLine(tokens: Token[]) {
    if (tokens[0]?.type === 'DEFINE') {
      this.handleDefine(tokens)
    } else if (this.currentClass && tokens[1]?.type === 'HAS') {
      this.handleClassMember(tokens)
    } else if (tokens.includes('is') && tokens.includes('new')) {
      this.handleInstanceCreation(tokens)
    }
  }
}
```

## パフォーマンス比較

| アプローチ | 複雑度 | パフォーマンス | 拡張性 | デバッグ |
|-----------|--------|---------------|-------|----------|
| Chevrotain | 高 | 中 | 高 | 困難 |
| 線形パーサー | 低 | 高 | 中 | 簡単 |

## 推奨アクション

1. **PoC実装**: 線形パーサーでコア機能を実装
2. **比較テスト**: 既存テストが通ることを確認
3. **段階的移行**: 機能ごとに置き換え
4. **最終判断**: 複雑度とメンテナンス性で決定