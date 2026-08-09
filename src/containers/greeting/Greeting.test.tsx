import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Greeting from './Greeting';
import { vi } from 'vitest';

const mockTheme = {
  body: '#FFFFFF',
  text: '#000000',
  highlight: '#1a1a1a',
  dark: '#000000',
  secondaryText: '#808080',
  imageHighlight: '#1a8917',
  compImgHighlight: '#f1f1f1',
  jacketColor: '#1a8917',
  headerColor: '#1a1a1a70',
  splashBg: '#FFFFFF',
  expTxtColor: '#000000',
};

vi.mock('../../portfolio', () => ({
  greeting: {
    title: 'Amrit Bhattarai',
    subTitle: 'A sample subtitle',
    portfolio_repository: 'https://github.com/amritbh',
    heroChips: [
      { icon: '☁️', label: 'Cloud Architect @ HP', link: 'https://www.linkedin.com/in/bamrit/' },
      { icon: '🏔️', label: 'Adventurer', link: '/travel' },
    ],
    heroStats: [{ value: '5+', label: 'Himalayan Treks' }],
  },
}));

describe('Greeting Component', () => {
  it('renders correctly with correct links', () => {
    render(
      <BrowserRouter>
        <Greeting theme={mockTheme} />
      </BrowserRouter>
    );
    
    // Check main title
    expect(screen.getByText('Amrit Bhattarai')).toBeInTheDocument();
    
    // Check chips
    expect(screen.getByText('Cloud Architect @ HP')).toBeInTheDocument();
    expect(screen.getByText('Adventurer')).toBeInTheDocument();
    
    // Check chip links
    const externalChipLink = screen.getByRole('link', { name: /☁️ Cloud Architect @ HP/i });
    expect(externalChipLink).toHaveAttribute('href', 'https://www.linkedin.com/in/bamrit/');
    expect(externalChipLink).toHaveAttribute('target', '_blank');
    
    const internalChipLink = screen.getByRole('link', { name: /🏔️ Adventurer/i });
    expect(internalChipLink).toHaveAttribute('href', '/travel');
    
    // Check CTA buttons
    const blogBtn = screen.getByRole('link', { name: /Read My Blog/i });
    expect(blogBtn).toHaveAttribute('href', '/blogs');
    
    const travelBtn = screen.getByRole('link', { name: /Travel Blog/i });
    expect(travelBtn).toHaveAttribute('href', '/travel');
    
    const githubBtn = screen.getByRole('link', { name: /Star on GitHub/i });
    expect(githubBtn).toHaveAttribute('href', 'https://github.com/amritbh/myPortfolio');
  });
});
