/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Factory } from 'meteor/dburles:factory';
import chai from 'chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Tasks } from '../api/tasks';


import { withRenderedTemplate } from './test-helpers';

if (Meteor.isClient) {
  import './task';
  describe('Task', function () {
    beforeEach(function () {
      Template.registerHelper('_', key => key);
    });
  
    afterEach(function () {
      Template.deregisterHelper('_');
    });
  
    it('renders correctly with simple data', function () {
      const task = Factory.build('task', { checked: false });
      const data = {
        task: Tasks._transform(task),
        onEditingChange: () => 0,
      };
  
      withRenderedTemplate('task', data, el => {
        chai.assert.equal($(el).find('input[type=text]').val(), task.text);
        chai.assert.equal($(el).find('.list-item.checked').length, 0);
        chai.assert.equal($(el).find('.list-item.editing').length, 0);
      });
    });
  });
}