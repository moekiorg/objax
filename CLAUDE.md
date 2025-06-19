# Objax開発プロジェクト - 進捗記録

## プロジェクト概要
**Objax言語**と直接操作でアプリケーションやゲームを開発できるソフトウェアの開発

### 技術スタック
- [Vite] + [React] + [TypeScript]
- [Zustand] (状態管理)
- [Tailwind CSS] (スタイリング)
- [Local Storage] (永続化)
- [pnpm] (パッケージ管理)
- [Biome] (コード品質)
- [Vitest] + [React Testing Library] (テスト)

## アーキテクチャ

### データ構造
```json
{
  "pages": [{"name": "ホゲホゲ"}],
  "states": [{
    "name": "score",
    "history": [{"date": "2025-05-10", "score": 24}]
  }],
  "instances": [{
    "name": "counter",
    "label": "Up", 
    "color": "black",
    "width": "100px",
    "onChange": "add 1 to field content of counter",
    "page": "ホゲホゲ"
  }],
  "classes": [{
    "name": "Task",
    "code": "define Task...",
    "fields": [{"name": "done", "default": false}],
    "methods": [{"name": "do", "code": "set field..."}]
  }]
}
```

### UIオブジェクト種類
- [ButtonMorph]
- [FieldMorph] (文字列/数字/Boolean/日付)
- [ListMorph]
- [GroupMorph]

## 開発進捗

### ✅ 完了済み機能

#### 1. プロジェクト基盤 (2025-06-19)
- **Vite React TypeScript** プロジェクト初期化
- **依存関係インストール**: Zustand, Tailwind, DND Kit, Biome, Vitest
- **開発環境設定**: Biome設定、Vitest設定、テストライブラリ
- **プロジェクト構造**: src/{components,stores,types,utils}

#### 2. データ管理システム (2025-06-19)
- **TypeScript型定義**: ObjaxProject, ObjaxClass, ObjaxInstance, ObjaxState
- **Zustandストア**: 完全なCRUD操作、永続化設定
- **Local Storage連携**: 自動保存・復元機能

#### 3. 基本UI実装 (2025-06-19)  
- **PageGrid**: ページ一覧のグリッド表示
- **App**: ページナビゲーション
- **Tailwind CSS**: 設定・スタイル適用

#### 4. Objax言語エンジン (2025-06-19)

##### 4.1 初期実装 (Chevrotain使用)
- **基本パーサー**: クラス定義、フィールド定義
- **レクサー・パーサー・インタープリター**: モジュラー設計
- **テスト**: TDDアプローチで1テスト→実装→green

##### 4.2 機能拡張
- **デフォルト値フィールド**: `Task has field "done" has default false`
- **メソッド定義**: `Task has method "complete" do set field "done" of myself to true`
- **インスタンス作成**: `myTask is a new Task`

##### 4.3 パーサー問題と解決 ⭐
**問題**: Chevrotainで複合文の解析が困難
```objax
define Task
Task has field "title"
myTask is a new Task  // ← パーサーエラー
```

**解決**: **線形パーサーへの完全移行**
- Chevrotainの複雑さを排除
- 状態管理ベースの線形解析
- 250行のシンプルな実装

### 📊 移行結果比較

| 項目 | Chevrotain | 線形パーサー |
|------|-----------|-------------|
| **テスト通過** | 4/5 | **11/11 (100%)** |
| **コード量** | 300+ lines | **250 lines** |
| **ファイル数** | 4 files | **1 file** |
| **複雑度** | 高 | **低** |
| **複合文対応** | ❌ | **✅** |
| **依存関係** | chevrotain | **なし** |

### 🎯 現在の実装機能

#### Objax言語サポート (完全動作)
```objax
define Task
Task has field "title"
Task has field "done" has default false
Task has method "complete" do set field "done" of myself to true
myTask is a new Task
```

#### テスト状況
- **11/11 テスト通過** (100%)
- 基本クラス定義
- デフォルト値フィールド  
- メソッド定義
- インスタンス作成
- **複合文解析** (最難関を解決)

## 技術的成果

### 1. パーサー設計の革新
- **文脈認識**: クラス定義中vs.トップレベル文の自動判別
- **状態管理**: currentClassによる解析状態の管理
- **エラーハンドリング**: 明確なエラーメッセージ

### 2. 線形パーサーの優位性
```javascript
class LinearObjaxParser {
  private currentClass: ObjaxClassDefinition | null = null
  
  parseLine(line: string) {
    if (line.startsWith('define ')) {
      this.handleClassDefinition(line)
    } else if (this.currentClass && line.includes(' has ')) {
      this.handleClassMember(line)  
    } else if (line.includes(' is a new ')) {
      this.handleInstanceCreation(line)
    }
  }
}
```

### 3. トークナイザー設計
- 文字列リテラル認識: `/"[^"]*"|[^\s]+/g`
- 型分類: DEFINE, HAS, FIELD, METHOD, STRING, IDENTIFIER
- 値解析: Boolean(true/false), String, Number

## 次期開発計画

### Phase 1: UI統合
- [ ] Objaxエンジンとページエディタの連携
- [ ] リアルタイムコード実行・プレビュー
- [ ] エラー表示・デバッグ機能

### Phase 2: UI オブジェクト
- [ ] ButtonMorph実装: `buttonMorph is a new ButtonMorph`
- [ ] FieldMorph実装: 文字列/数字/Boolean/日付
- [ ] ListMorph/GroupMorph実装

### Phase 3: 実行エンジン
- [ ] メソッド呼び出し: `call "complete" on myTask`
- [ ] ステート操作: `set state "score" to 100`
- [ ] ページ遷移: `go to page "HomePage"`

### Phase 4: 高度機能
- [ ] インスペクター: UIオブジェクトのプロパティ編集
- [ ] クラスブラウザ: 定義済みクラスの管理
- [ ] プレイグラウンド: コード実験環境

## 重要な設計決定

### 1. 線形パーサー採用理由
- **Objax言語の特性**: 行指向、文脈依存、状態管理が重要
- **シンプルさ**: デバッグ・拡張・保守が容易
- **パフォーマンス**: 直接解析で高速

### 2. TDD適用
- Red → Green → Refactor サイクル
- 1つずつテストケース追加
- 機能拡張の安全性確保

### 3. モジュラー設計  
- types.ts: 型定義の集約
- linearParser.ts: 言語解析エンジン
- objaxEngine.ts: 公開インターフェース

## コミット履歴重要点

1. **`48d11cf`**: 初期Viteプロジェクト + 依存関係
2. **`ef5bed9`**: Tailwind CSS設定
3. **`fdc3077`**: 開発環境設定 (Biome, Vitest)
4. **`de35741`**: データ構造・Zustandストア実装
5. **`e39127a`**: PageGrid初期画面実装
6. **`c7d6257`**: Chevrotainベース基本エンジン
7. **`6873055`**: デフォルト値フィールド実装
8. **`7809f0d`**: メソッド定義実装
9. **`dcdf3b0`**: 🔄 **線形パーサー完全移行** (重要)

## 技術負債・改善点

### 解決済み
- ✅ 複合文解析問題 (線形パーサーで解決)
- ✅ Chevrotain複雑性 (除去完了)
- ✅ パーサーエラーハンドリング (改善)

### 今後の課題
- UI統合の複雑性管理
- 実行時エラーハンドリング
- パフォーマンス最適化 (大規模プロジェクト対応)

## 開発体制・ツール

### コード品質
- **Biome**: Linting + Formatting (ESLint代替)  
- **TypeScript**: 型安全性
- **Vitest**: 高速テスト実行

### パッケージ管理
- **pnpm**: 高速・効率的
- **依存関係最小化**: chevrotain除去でよりシンプル

### Git管理
- 機能単位でのコミット
- 詳細なコミットメッセージ
- TDD サイクルでの安全な開発

---

## 📝 メモ: 次回開始時の状況

- **✅ 基盤完成**: Objax言語エンジンが完全動作
- **✅ テスト充実**: 11/11 テスト通過
- **✅ 線形パーサー**: 複合文対応、拡張可能
- **🔄 次ステップ**: UI統合・実際のアプリケーション作成機能

### すぐ始められる作業
1. UIオブジェクト作成機能
2. ページエディタとの統合  
3. リアルタイム実行環境
4. インスペクター機能

**現在のObjaxエンジンは本格的なアプリケーション開発の基盤として利用可能**