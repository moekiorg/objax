# DataMorph 機能例

## 例1: ユーザープロフィール表示

### Objaxコード
```objax
// ユーザーデータを作成
userData is a new FieldMorph
userData.label is "ユーザー名"
userData.value is "田中太郎"

userAge is a new FieldMorph
userAge.label is "年齢"
userAge.value is 30

userActive is a new FieldMorph
userActive.label is "アクティブ"
userActive.value is true

// DataMorphでプロフィール表示
userProfile is a new DataMorph
```

### Inspector設定
- **ラベル**: "ユーザープロフィール"
- **データソース**: "userData"
- **表示フィールド**: "label, value"

### 結果
DataMorphに「userData」の内容が読み取り専用で表示されます。

---

## 例2: タスク詳細ビュー

### Objaxコード
```objax
// カスタムタスククラス定義
Task is a Class
Task has field "title" has default "新しいタスク"
Task has field "completed" has default false
Task has field "priority" has default "medium"
Task has field "dueDate" has default "2025-01-01"

// タスクインスタンス作成
myTask is a new Task
myTask.title is "プロジェクト完了"
myTask.completed is false
myTask.priority is "high"
myTask.dueDate is "2025-01-15"

// タスク詳細表示用DataMorph
taskDetails is a new DataMorph
```

### Inspector設定
- **ラベル**: "タスク詳細"
- **データソース**: "myTask"  
- **表示フィールド**: "title, completed, priority, dueDate"

### 結果
myTaskの全フィールドが読み取り専用で整理されて表示されます。

---

## 例3: 商品情報ダッシュボード

### Objaxコード
```objax
// 商品データ作成
product is a new FieldMorph
product.label is "商品名"
product.value is "ワイヤレスイヤホン"

productPrice is a new FieldMorph
productPrice.label is "価格"
productPrice.value is 8500

productStock is a new FieldMorph
productStock.label is "在庫"
productStock.value is 25

productCategory is a new FieldMorph
productCategory.label is "カテゴリ"
productCategory.value is "Electronics"

// 商品情報表示
productInfo is a new DataMorph

// 在庫状況表示（別のDataMorph）
stockStatus is a new DataMorph
```

### Inspector設定

**productInfo:**
- **ラベル**: "商品基本情報"
- **データソース**: "product"
- **表示フィールド**: "label, value"

**stockStatus:**
- **ラベル**: "在庫・価格情報"  
- **データソース**: "productStock"
- **表示フィールド**: "label, value"

### 結果
2つのDataMorphで商品情報を異なる観点から表示できます。

---

## 例4: 直接データ入力（インスタンス参照なし）

### Objaxコード
```objax
// DataMorphのみ作成
configData is a new DataMorph
```

### Inspector設定
- **ラベル**: "設定データ"
- **データソース**: (空欄)
- **レコードデータ (JSON)**: 
```json
{
  "theme": "dark",
  "language": "ja",
  "notifications": true,
  "autoSave": false
}
```
- **表示フィールド**: "theme, language, notifications"

### 結果
JSON形式で直接設定したデータが編集可能な形で表示されます。

---

## 例5: リスト項目の詳細表示

### Objaxコード
```objax
// タスクリスト作成
todoList is a new ListMorph
todoList.label is "TODOリスト"
todoList.items is ["プロジェクト企画", "資料作成", "会議準備", "レビュー実施"]

// 選択された項目の詳細
selectedTask is a new DataMorph
```

### Inspector設定
- **ラベル**: "選択中のタスク"
- **データソース**: "todoList"
- **表示フィールド**: "label, items"

### 結果
todoListの内容が読み取り専用で表示され、リストの概要を確認できます。

---

## 使用方法

1. **ページ作成**: 新しいページを作成
2. **Objaxコード実行**: 上記のコードをページに記述・実行
3. **DataMorph配置**: New UI InstanceからDataMorphをドラッグ&ドロップ
4. **Inspector設定**: Cmd+ClickでInspectorを開き、データソースと表示フィールドを設定
5. **結果確認**: DataMorphに設定したデータが表示される

## 特徴

- **読み取り専用**: インスタンス参照時は元データを保護
- **柔軟な表示**: displayFieldsで必要なフィールドのみ表示
- **リアルタイム**: 参照先データの変更が即座に反映
- **フォールバック**: 参照先が見つからない場合も正常動作
- **型対応**: 文字列、数字、Boolean値を適切に表示・編集