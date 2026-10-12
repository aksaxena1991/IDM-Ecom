import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplashScreen } from './SplashScreen';
const meta: Meta<typeof SplashScreen> = { title: 'Display/SplashScreen', component: SplashScreen, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof SplashScreen>;
export const Default: Story = { decorators: [(S) => <div style={{ width: 360 }}><S /></div>] };
