require('@testing-library/jest-dom');

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
      pathname: '/',
      query: {},
    };
  },
}));

// Mock supabase client
jest.mock('./lib/supabaseClient', () => {
  const mFrom = () => ({
    select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
    upsert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    update: jest.fn(() => Promise.resolve({ data: null, error: null })),
    delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
    eq: jest.fn(() => mFrom()),
    order: jest.fn(() => Promise.resolve({ data: [], error: null })),
  });
  return {
    supabase: {
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      },
      from: jest.fn(() => mFrom()),
    },
  };
});

// Mock createClient from supabase-js
afterAll(() => {
  jest.resetModules();
});

jest.mock('@supabase/supabase-js', () => {
  const mSupabase = {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
      upsert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
      eq: jest.fn(() => ({ order: () => Promise.resolve({ data: [], error: null }) })),
    })),
  };
  return {
    createClient: jest.fn(() => mSupabase),
  };
}); 