import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import publicationUtils from './utils/publication_utils';
import createMethods from './create_methods';
import IsAllowed from './is_allowed';

export default (config) => {
  const isAllowed = IsAllowed(config);
  const { collections } = config;

  const createPublication = (name) => {
    const { list, edit, counts } = publicationUtils.getPublications(name);
    const { collection } = collections[name];

    /* eslint meteor/audit-argument-checks: 0*/
    Meteor.publish(list, function (query, options) {
      if (isAllowed(name, this.userId)) {
        // can't reuse "users" cursor
        Counts.publish(this, counts, collection.find(query, options));
        return collection.find(query, options);
      }
    });
    Meteor.publish(edit, function (_id) {
      if (isAllowed(name, this.userId)) {
        return collection.find(_id);
      }
    });
  };
  const createPublications = () => {
    Object.keys(collections).forEach(createPublication);
  };
  createPublications();
  createMethods(config);
};
