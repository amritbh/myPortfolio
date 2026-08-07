// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PullRequests from './PullRequests';

test('renders PullRequests without crashing', () => {
  render(
    <BrowserRouter>
      <PullRequests theme={{ text: 'black', body: 'white' }} pullRequest={{ url: '', title: '' }} github={{}} />
    </BrowserRouter>
  );
});
