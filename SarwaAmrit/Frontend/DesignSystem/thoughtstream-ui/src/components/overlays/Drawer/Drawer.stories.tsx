import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer, DrawerBody, DrawerFooter, type DrawerPlacement } from './Drawer';
import { Button } from '../../actions/Button';
import { Typography } from '../../typography/Typography';
import { Input } from '../../actions/Input';
import { List, ListItem } from '../../typography/List';
import { PanelLeft, PanelRight, ArrowUp, ArrowDown, Bookmark, Settings } from 'lucide-react';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Placements: StoryObj = {
  render: () => {
    const [openPlacement, setOpenPlacement] = useState<DrawerPlacement | null>(null);

    return (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Button
          variant="secondary"
          onClick={() => setOpenPlacement('left')}
          leftIcon={<PanelLeft size={16} />}
        >
          Left Drawer
        </Button>
        <Button
          variant="primary"
          onClick={() => setOpenPlacement('right')}
          leftIcon={<PanelRight size={16} />}
        >
          Right Drawer (Default)
        </Button>
        <Button
          variant="secondary"
          onClick={() => setOpenPlacement('top')}
          leftIcon={<ArrowUp size={16} />}
        >
          Top Drawer
        </Button>
        <Button
          variant="secondary"
          onClick={() => setOpenPlacement('bottom')}
          leftIcon={<ArrowDown size={16} />}
        >
          Bottom Drawer
        </Button>

        <Drawer
          isOpen={openPlacement !== null}
          placement={openPlacement || 'right'}
          onClose={() => setOpenPlacement(null)}
          title={`Contemplative Drawer (${openPlacement?.toUpperCase()})`}
          subtitle="ARCHIVAL TOOLS & READING CONTROLS"
        >
          <DrawerBody>
            <Typography variant="body" measure>
              Sliding drawer anchored to the {openPlacement} edge. Clean 0px geometry, flat plane,
              and hairline divider borders maintain the serene editorial aesthetic.
            </Typography>

            <div style={{ marginTop: '24px' }}>
              <Input
                label="Quick Note"
                placeholder="Jot down a fleeting thought..."
              />
            </div>

            <div style={{ marginTop: '24px' }}>
              <Typography variant="overline" color="brand">Recent Marginalia</Typography>
              <List>
                <ListItem
                  leading={<Bookmark size={18} />}
                  primaryText="Margin note on Chapter 4"
                  secondaryText="Added 2 hours ago"
                />
                <ListItem
                  leading={<Settings size={18} />}
                  primaryText="Typographic preferences"
                  secondaryText="Updated yesterday"
                />
              </List>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="ghost" size="small" onClick={() => setOpenPlacement(null)}>
              Dismiss
            </Button>
            <Button variant="primary" size="small" onClick={() => setOpenPlacement(null)}>
              Save Adjustments
            </Button>
          </DrawerFooter>
        </Drawer>
      </div>
    );
  },
};
