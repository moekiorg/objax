import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatabaseMorph } from './DatabaseMorph';
import type { ObjaxInstance } from '../types';

// Mock data
const mockDataInstances: ObjaxInstance[] = [
  {
    id: '1',
    name: 'myTasks',
    className: 'ListMorph',
    page: 'test',
    type: 'ListMorph',
    items: ['Task 1', 'Task 2', 'Task 3']
  }
];

const mockDatabaseInstance: ObjaxInstance = {
  id: '2',
  name: 'myTaskListView',
  className: 'DatabaseMorph',
  page: 'test',
  type: 'DatabaseMorph',
  dataSource: 'myTasks',
  viewMode: 'table',
  fields: ['value'],
  label: 'Task List'
};

const mockDatabaseInstanceNoFields: ObjaxInstance = {
  id: '3',
  name: 'emptyView',
  className: 'DatabaseMorph',
  page: 'test',
  type: 'DatabaseMorph',
  dataSource: 'myTasks',
  viewMode: 'table',
  label: 'Empty View'
};

describe('DatabaseMorph', () => {
  it('renders with basic props', () => {
    render(
      <DatabaseMorph 
        instance={mockDatabaseInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    // ビューモードボタンが表示されることを確認
    expect(screen.getByText('テーブル')).toBeInTheDocument();
    expect(screen.getByText('グリッド')).toBeInTheDocument();
  });

  it('displays data in table format', () => {
    render(
      <DatabaseMorph 
        instance={mockDatabaseInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    // Check table structure
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('value')).toBeInTheDocument(); // column header
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('displays data in grid format', () => {
    const gridInstance = { ...mockDatabaseInstance, viewMode: 'grid' as const };
    
    render(
      <DatabaseMorph 
        instance={gridInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    // Grid layout should show items
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('shows no data message when dataSource is not found', () => {
    const emptyInstance = { ...mockDatabaseInstance, dataSource: 'nonexistent' };
    
    render(
      <DatabaseMorph 
        instance={emptyInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    expect(screen.getByText('表示するデータがありません')).toBeInTheDocument();
  });

  it('shows only view mode buttons when no fields are set', () => {
    render(
      <DatabaseMorph 
        instance={mockDatabaseInstanceNoFields}
        dataInstances={mockDataInstances}
      />
    );
    
    // View mode buttons should be visible
    expect(screen.getByText('テーブル')).toBeInTheDocument();
    expect(screen.getByText('グリッド')).toBeInTheDocument();
    
    // No table or grid content should be displayed
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
  });

  it('shows only view mode buttons in grid mode when no fields are set', () => {
    const gridInstance = { ...mockDatabaseInstanceNoFields, viewMode: 'grid' as const };
    
    render(
      <DatabaseMorph 
        instance={gridInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    // View mode buttons should be visible
    expect(screen.getByText('テーブル')).toBeInTheDocument();
    expect(screen.getByText('グリッド')).toBeInTheDocument();
    
    // No grid content should be displayed
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('表示するデータがありません')).not.toBeInTheDocument();
  });

  it('shows view mode buttons', () => {
    render(
      <DatabaseMorph 
        instance={mockDatabaseInstance}
        dataInstances={mockDataInstances}
      />
    );
    
    expect(screen.getByText('テーブル')).toBeInTheDocument();
    expect(screen.getByText('グリッド')).toBeInTheDocument();
  });

  it('renders boolean values as checkboxes', () => {
    const booleanDataInstances: ObjaxInstance[] = [
      {
        id: '4',
        name: 'taskList',
        className: 'TaskList',
        page: 'test',
        type: 'TaskList',
        items: [
          { title: 'Task 1', done: true },
          { title: 'Task 2', done: false }
        ]
      }
    ];

    const booleanInstance: ObjaxInstance = {
      id: '5',
      name: 'taskView',
      className: 'DatabaseMorph',
      page: 'test',
      type: 'DatabaseMorph',
      dataSource: 'taskList',
      viewMode: 'table',
      fields: ['title', 'done'],
      label: 'Task View'
    };

    render(
      <DatabaseMorph 
        instance={booleanInstance}
        dataInstances={booleanDataInstances}
      />
    );
    
    // ヘッダーを確認
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('done')).toBeInTheDocument();
    
    // 文字列値を確認
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    
    // チェックボックスを確認
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked(); // Task 1は完了
    expect(checkboxes[1]).not.toBeChecked(); // Task 2は未完了
  });

  it('updates data when checkbox is clicked', () => {
    const onUpdate = vi.fn();
    const booleanDataInstances: ObjaxInstance[] = [
      {
        id: '4',
        name: 'taskList',
        className: 'TaskList',
        page: 'test',
        type: 'TaskList',
        items: [
          { title: 'Task 1', done: true },
          { title: 'Task 2', done: false }
        ]
      }
    ];

    const booleanInstance: ObjaxInstance = {
      id: '5',
      name: 'taskView',
      className: 'DatabaseMorph',
      page: 'test',
      type: 'DatabaseMorph',
      dataSource: 'taskList',
      viewMode: 'table',
      fields: ['title', 'done'],
      label: 'Task View'
    };

    render(
      <DatabaseMorph 
        instance={booleanInstance}
        dataInstances={booleanDataInstances}
        onUpdate={onUpdate}
      />
    );
    
    // 2番目のチェックボックス（Task 2のdone）をクリック
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    
    // データ更新が呼ばれることを確認
    expect(onUpdate).toHaveBeenCalledWith('4', {
      ...booleanDataInstances[0],
      items: [
        { title: 'Task 1', done: true },
        { title: 'Task 2', done: true } // falseからtrueに変更
      ]
    });
  });
});