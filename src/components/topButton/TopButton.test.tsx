import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TopButton from './TopButton';

test('renders TopButton without crashing', () => {
  render(
    <BrowserRouter>
      <TopButton theme={{ text: 'black', body: 'white', compImgHighlight: 'white', highlight: 'white', secondaryText: 'gray', imageHighlight: 'white' }} />
    </BrowserRouter>
  );
});
