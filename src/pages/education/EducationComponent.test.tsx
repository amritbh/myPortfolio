// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Education from './EducationComponent';

test('renders Education without crashing', () => {
  render(
    <BrowserRouter>
      <Education theme={{ text: 'black', body: 'white' }} pullRequest={{ url: '', title: '' }} github={{}} />
    </BrowserRouter>
  );
});
