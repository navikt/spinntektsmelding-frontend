import { expect } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

import '@testing-library/jest-dom/extend-expect';

// import '@testing-library/jest-dom/extend-expect';
import { toHaveNoViolations } from 'jest-axe';

// Extend the functionality to support axe
expect.extend(toHaveNoViolations);
