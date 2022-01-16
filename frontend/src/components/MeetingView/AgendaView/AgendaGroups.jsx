/* eslint-disable react/jsx-props-no-spreading */
// Necessary as dnd sort uses prop spreading for its listeners and props
import React, { useState } from 'react';
import {
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import './AgendaGroup.scss';

import {
  useDroppable,
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  StatusInProgress, AddIcon, RemoveIcon,
} from '../../../utils/_icons';

import MeetingItemStates from '../../../constants/MeetingItemStates';
import AgendaItem from './AgendaItem';

/**
 * A group of agenda items in a collapsible accordion.
 *
 * props:
 *    agendaGroups
 *      Object that represents an agenda group.
 *      {
 *        id: Number id of group
 *        title:  String title of group
 *        description:  String description of group
 *        status: String status of group
 *        items: An array of agenda group's sub items
 *      }
 */

// Necessary to allow the dragging of an item into an empty group
const options = {
  minHeightAgendaContainer: '60px',
};

// setter function
const setActiveGroups = (agendaGroups) => {
  const activeG = [];
  agendaGroups.forEach((group, i) => {
    const progressFlag = group.items.some((item) => item.status === MeetingItemStates.IN_PROGRESS);
    if (progressFlag) {
      activeG.push(i);
    }
  });
  return activeG;
};

function AgendaGroups({
  agendaGroups, expandedAcordians, admin,
}) {
  // array of indexes to indicate which group has an active member
  const [activeGroups] = useState(setActiveGroups(agendaGroups));
  // prefix for the uuid
  const groupId = 'group-id';

  // AgendaGroup was split into header and body to permit seperate dragging of the group and items.
  return (
    <>
      {agendaGroups.map((parent, i) => (
        <AccordionItem className="AgendaGroup" key={`${parent.id}accord`} uuid={groupId + parent.id}>
          <AgendaGroupHeader
            agendaGroup={parent}
            active={activeGroups.some((aGroup) => aGroup === i)}
            expanded={expandedAcordians.some((elem) => elem === groupId + parent.id)}
          />
          <AgendaGroupBody
            key={`${parent.id}agendaGroup`}
            admin={admin}
            agendaGroup={parent}
          />
        </AccordionItem>
      ))}
    </>
  );
}

function AgendaGroupHeader({ agendaGroup, active, expanded }) {
  return (
    <div>
      <AccordionItemHeading className="group-header">
        <AccordionItemButton className={active ? 'group-button active' : 'group-button'}>
          <div className="button-text">
            <div className="group-title">
              {agendaGroup.title_loc_key}
              <br />
              {active && (
              <span className="groupStatus">
                <StatusInProgress />
                In Progress
              </span>
              )}
            </div>
            <div className={active ? 'group-in-progress' : 'group-not-in-progress'}>
              {!expanded ? <AddIcon /> : <RemoveIcon />}
            </div>
          </div>
        </AccordionItemButton>
      </AccordionItemHeading>
    </div>

  );
}

function AgendaGroupBody({
  agendaGroup, admin,
}) {
  const { setNodeRef } = useDroppable({
    id: agendaGroup.dropID,
  });

  // needed to ensure the dragable element can be placed when the container is empty
  const style = {
    minHeight: options.minHeightAgendaContainer,
  };

  return (
    <SortableContext
      items={admin ? agendaGroup.items.map((item) => item.id) : []}
      strategy={verticalListSortingStrategy}
    >
      <AccordionItemPanel className="group-items">
        <div style={style} ref={setNodeRef}>
          {agendaGroup.items.map((item) => (
            <AgendaItem
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </AccordionItemPanel>
    </SortableContext>
  );
}

export default AgendaGroups;
