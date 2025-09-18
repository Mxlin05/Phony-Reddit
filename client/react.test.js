import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Banner } from './src/components/mainPage';




describe('Create Post Button', () => {
  const dummyProps = {
    setView: jest.fn(),
    setSearchQuerry: jest.fn(),
    setUserView: jest.fn(),
    admin: null,
    setAdmin: jest.fn()
  }

test("create post is disabled for guest", () => {
    render(<Banner {...dummyProps} userView={null} view="home"/>);
    const createPostButton = screen.getByText(/create post/i);
    expect(createPostButton).toBeDisabled();
});

test("create post is enabled for user", () => {
    const user = { username: 'testuser' };
    render(<Banner {...dummyProps} userView={user} view="home"/>);
    const createPostButton = screen.getByText(/create post/i);
    expect(createPostButton).toBeEnabled();

});

});


