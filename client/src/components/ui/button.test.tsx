import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';
import React from 'react';

describe('Button component', () => {
  it('renders children and applies class', () => {
    render(<Button variant="secondary">Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    // Should have variant-specific class (secondary)
    expect(btn.className).toMatch(/bg-secondary/);
  });
}); 