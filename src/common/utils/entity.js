import _ from 'lodash';

/**
 * Unflatten an entity and all its childrens
 *
 * @param {any} entities List of all entities
 * @param {any} parent Entity to unflatten
 * @param {any} info Global information of unflatten operation
 * keep by the function unflattenEntities
 * @returns Return the parent with all gathered childrens
 */
function unflattenEntity(entities, parent, info) {
  // Save this entity to hash IDs
  const infoRef = info;
  const parentRef = parent;

  // Get parents
  const ancestors = _(entities)
    .filter(ancestor => ancestor.tree_rank === parent.tree_rank
        && ancestor.left_id < parent.left_id
        && ancestor.right_id > parent.right_id)
    .sort((a, b) => a.tree_rank - b.tree_rank || a.left_id - b.left_id || a.right_id - b.right_id)
    .value();

  // Get depth level of this parent
  const parentDepthLevel = ancestors.length;

  // Get all immediate children of this entity (one level under)
  const immediateChildrens = _(entities)
  // Get ANY children of the parent entity
    .filter(child => child.tree_rank === parent.tree_rank
      && child.left_id > parent.left_id
      && child.right_id < parent.right_id)

    // Only keep immediate children (parent depth level + 1)
    .filter(child => entities.filter(ancestor => ancestor.tree_rank === child.tree_rank
        && ancestor.left_id < child.left_id
        && ancestor.right_id > child.right_id).length === parentDepthLevel + 1)
    .value();

  // Set parent
  const lastAncestor = _(ancestors).last();
  parentRef.parent = lastAncestor ? infoRef.hashIds[lastAncestor.id] : null;

  // Set hash id
  infoRef.hashIds[parent.id] = parentRef;

  // Children array should always be present
  if (!Array.isArray(parent.children)) {
    parentRef.children = [];
  }

  // Look for children
  if (!_.isEmpty(immediateChildrens)) {
    parentRef.children = immediateChildrens;
    immediateChildrens.map(child => unflattenEntity(entities, child, info));
  }

  // Return parent
  return parentRef;
}

/**
 * Unflatten a list of entities
 * There may be only one root node or more
 * No need to sort the array by a specific order
 *
 * @param {any} entities Entities to unflatten
 * @returns Return all entities unflatten plus an hash
 * table to keep a reference on them using their ID as key
 */
function unflattenEntities(entities) {
  // Function result
  const info = {
    tree: [],
    hashIds: {},
  };

  // Get only root level entities
  const rootLevelEntities = _.filter(entities, x => x.left_id === 1);
  for (let i = 0; i < rootLevelEntities.length; i += 1) {
    const et = _.cloneDeep(rootLevelEntities[i]);
    info.tree.push(et);
    unflattenEntity(entities, et, info);
  }
  return info;
}

// Export all functions of this module
export default {
  /**
   * Convert user unit to database
   *
   * @param {Array} rowEntities Array of entities. For this function to work,
   * each items of the array must contains (at least) the following
   * properties
   *  {
   *    id,
   *    tree_rank,
   *    left_id,
   *    right_id,
   *  }
   * @returns Return an object like
   *  {
   *    tree: [
   *      [
   *         {
   *             "id":1,
   *             "name":"Intelia",
   *             "tree_rank":1,
   *             "left_id":1,
   *             "right_id":60,
   *             "updated_at":"2017-10-03T14:19:17.006Z",
   *             "parent":{},
   *             "children":[
   *               {
   *                   "id":2,
   *                   "name":"Projets pilotes",
   *                   "tree_rank":1,
   *                   "left_id":2,
   *                   "right_id":5,
   *                   "updated_at":"2017-10-02T19:46:50.320Z",
   *                   "parent":{},
   *                   "children":[
   *                     {
   *                         "id":38,
   *                         "name":"David Mercier",
   *                         "tree_rank":1,
   *                         "left_id":3,
   *                         "right_id":4,
   *                         "updated_at":"2017-10-02T19:46:50.320Z",
   *                         "parent":{},
   *                         "children":[
   *                            ...
   *                         ]
   *                     }
   *                   ]
   *               },
   *           ]
   *       }
   *    ],
   *    hashIds: {},
   *  };
   */
  entityToTree(rowEntities) {
    return unflattenEntities(_.cloneDeep(rowEntities));
  },
  /**
   * Get the string path of an entity up to its parent
   *
   * @param {any} entityNode Entity object. For this function to work,
   * this object must contains (at least) the following
   * properties
   *  {
   *    name,
   *    parent,
   *    children,
   *  }
   * @returns The path of the entity
   */
  pathToString(entityNode) {
    const parentArr = [];
    let parent = entityNode;
    while (parent) {
      parentArr.push(parent.name);
      ({ parent } = parent);
    }
    return _(parentArr)
      .reverse()
      .join('/');
  },

  /**
   * Validate an entity's name
   *
   * @param {String} name Entity's name
   * @returns Return true if name is valid, otherwise false
   */
  isNameValid(name) {
    return /^[^\\/]+$/.test(name);
  },
};
