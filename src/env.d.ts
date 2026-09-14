import type { Viewer } from './lib/auth';

declare global {
  namespace App {
    interface Locals {
      viewer?: Viewer;
    }
  }
}
