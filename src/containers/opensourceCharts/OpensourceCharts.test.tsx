// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OpensourceCharts from './OpensourceCharts';
import { vi } from 'vitest';

vi.mock('../../portfolio', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    bigProjects: { title: "", subtitle: "", projects: [{ link: '1', image: '1' }] },
    achievementSection: { title: "", subtitle: "", achivementsCards: [{ title: '1', subtitle: '1', image: '1', footerLink: [] }] },
    contactInfo: { title: "", subtitle: "", number: "", email_address: "" },
    blogSection: { title: "", subtitle: "", blogs: [{ url: '1', image: '1', title: '1', description: '1' }] },
    talkSection: { title: "", subtitle: "", talks: [{ title: '1', subtitle: '1', slides_url: '1', event_url: '1' }] },
    podcastSection: { title: "", subtitle: "", podcast: ['1'] }
  };
});

test('renders OpensourceCharts without crashing', () => {
  const { container } = render(
    <BrowserRouter>
      <OpensourceCharts theme={{ text: 'black', body: 'white', compImgHighlight: 'white', highlight: 'white', secondaryText: 'gray', imageHighlight: 'white' }} />
    </BrowserRouter>
  );
  expect(container).toBeTruthy();
});
