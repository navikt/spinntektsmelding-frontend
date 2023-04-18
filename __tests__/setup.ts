import { expect, vi } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

import '@testing-library/jest-dom/extend-expect';

// import '@testing-library/jest-dom/extend-expect';
import { toHaveNoViolations } from 'jest-axe';
import { setConfig } from 'next/config';

// Extend the functionality to support axe
expect.extend(toHaveNoViolations);

setConfig({
  // ...config,
  publicRuntimeConfig: {
    BASE_PATH: '/',
    SOME_KEY: 'your_value'
  },
  serverRuntimeConfig: {
    YOUR_KEY: 'your_value'
  }
});
