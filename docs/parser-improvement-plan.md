# Objax Parser 改善計画

## 現在の問題

複数の文を含む複合コードで、クラス定義内のメンバーとトップレベルのインスタンス作成が混在してパーサーエラーが発生。

## 改善案

### 案1: 文法構造の階層化（推奨）

```objax
program := topLevelStatement*

topLevelStatement := 
  | classDefinition
  | instanceCreation
  | assignmentStatement

classDefinition := 
  "define" Identifier classBody*

classBody := 
  | fieldDeclaration  
  | methodDeclaration

fieldDeclaration := 
  Identifier "has" "field" StringLiteral ("has" "default" literal)?

methodDeclaration := 
  Identifier "has" "method" StringLiteral "do" methodBody

instanceCreation := 
  Identifier "is" "a" "new" Identifier
```

**利点:**
- クラス内部とトップレベルの文脈が明確に分離
- 文法が階層的で理解しやすい
- 拡張しやすい構造

### 案2: 終端記号による明示的区切り

```objax
define Task
Task has field "title";
Task has field "done" has default false;
Task has method "complete" do set field "done" of myself to true;
end

myTask is a new Task;
```

**利点:**
- 明示的な境界で曖昧性を排除
- 他言語からの移植しやすい構文

**欠点:**
- 元のObjax言語仕様から離れる
- より冗長な記述が必要

### 案3: インデントベース構文

```objax
define Task
  Task has field "title"
  Task has field "done" has default false
  Task has method "complete" do set field "done" of myself to true

myTask is a new Task
```

**利点:**
- Pythonライクで現代的
- 視覚的に階層が分かりやすい

**欠点:**
- レクサーでの空白処理が複雑
- エラー処理が困難

## 推奨実装手順

1. **段階1**: 文法構造の階層化（案1）
2. **段階2**: より複雑な文の対応
3. **段階3**: エラーハンドリングの改善

## 実装優先度

- 🔴 **High**: 基本的な階層化文法
- 🟡 **Medium**: エラーメッセージの改善  
- 🟢 **Low**: 高度な構文サポート