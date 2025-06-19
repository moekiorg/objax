# 即座に適用可能な修正案

## 問題の核心
現在の文法では以下が区別できない：
- `Task has field "title"` (クラス内メンバー)  
- `myTask is a new Task` (トップレベル文)

## 即座に適用可能な解決策

### 解決策1: 文の先頭パターンで判別

```javascript
// パーサーで先読みして判別
classMember = this.RULE('classMember', () => {
  // クラス名 + "has" の組み合わせのみクラスメンバーとして認識
  this.CONSUME(Identifier, { LABEL: 'className' });
  this.CONSUME(Has);
  this.OR([
    { ALT: () => this.SUBRULE(this.fieldDeclarationBody) },
    { ALT: () => this.SUBRULE(this.methodDeclarationBody) },
  ]);
});
```

### 解決策2: 終端記号による区切り（推奨）

```objax
// "end" キーワードでクラス定義を明示的に終了
define Task
  Task has field "title"
  Task has field "done" has default false  
  Task has method "complete" do set field "done" of myself to true
end

myTask is a new Task
```

### 解決策3: 段階的対応（当面の対策）

1. **単一文のみサポート**: 現在の機能を保持
2. **複数実行**: 文を個別に実行して結果をマージ
3. **将来**: 完全な複合文法の実装

## 推奨アプローチ

**段階的対応**が最も現実的：
1. 現在の基本機能を維持
2. 複数文は分割して個別実行
3. 将来的に統合された文法に移行