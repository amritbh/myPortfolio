// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Certifications from './Certifications';

test('renders Certifications without crashing', () => {
  render(
    <BrowserRouter>
      <Certifications theme={{ text: 'black', body: 'white' }} pullRequest={{ url: '', title: '' }} github={{}} />
    </BrowserRouter>
  );
});
