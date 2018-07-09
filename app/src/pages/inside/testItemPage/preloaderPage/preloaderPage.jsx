import { PageLayout } from 'layouts/pageLayout';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';

export const PreloaderPage = () => (
  <PageLayout>
    <SpinningPreloader />
  </PageLayout>
);
