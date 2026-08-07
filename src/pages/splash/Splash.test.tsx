// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Splash from './Splash';

test('renders Splash without crashing', () => {
  render(
    <BrowserRouter>
      <Splash theme={{ text: 'black', body: 'white' } as any} />
    </BrowserRouter>
  );
});
