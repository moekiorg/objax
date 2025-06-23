import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ClassInspector } from './ClassInspector';
import type { ObjaxClass } from '../types';

describe('ClassInspector', () => {
  const sampleClasses: ObjaxClass[] = [
    {
      name: 'Task',
      code: 'Task is a Class',
      fields: [
        { name: 'title', default: '' },
        { name: 'done', default: false }
      ],
      methods: [
        { name: 'complete', code: 'self.done is true' }
      ]
    }
  ];

  it('renders class inspector with class name', () => {
    render(
      <ClassInspector 
        className="Task" 
        classes={sampleClasses} 
      />
    );

    expect(screen.getByText('Task')).toBeDefined();
  });

  it('shows fields tab by default', () => {
    render(
      <ClassInspector 
        className="Task" 
        classes={sampleClasses} 
      />
    );

    expect(screen.getByText('フィールド (2)')).toBeDefined();
    expect(screen.getByText('メソッド (1)')).toBeDefined();
    expect(screen.getByText('title')).toBeDefined();
    expect(screen.getByText('done')).toBeDefined();
  });

  it('handles missing class', () => {
    render(
      <ClassInspector 
        className="NonExistent" 
        classes={sampleClasses} 
      />
    );

    expect(screen.getByText('クラスが見つかりません')).toBeDefined();
  });
});