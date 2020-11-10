export const anItemCanBecomeAChild = [
  [{
    id: 1,
    name: 'Big green suitcase',
    description: 'A little scratched, but roomy'
  }, {
    id: 2,
    name: 'Ski gloves',
    description: 'Red and warm'
  }],
  [{
    rows: 1
  }],
  [{
    id: 1,
    name: 'Big green suitcase',
    description: 'A little scratched, but roomy',
    parent_id: null
  }],
  [{
    id: 2,
    name: 'Ski gloves',
    description: 'Red and warm',
    parent_id: 1
  }],
  [{
    id: 2,
    name: 'Ski gloves',
    description: 'Red and warm',
    parent_id: 1
  }],
  [{
    id: 1,
    name: 'Big green suitcase',
    description: 'A little scratched, but roomy',
    parent_id: null
  }],
  [{}]
]

export const anItemCanBeRemovedFromItsParent = [
  [{
    id: 1,
    name: "Big green suitcase",
    description: "A little scratched; roomy",
    parent_id: null
  }, {
    id: 2,
    name: "Ski gloves",
    description: "Red",
    parent_id: 1
  }, {
    id: 3,
    name: "Bandana",
    description: "Purple paisley",
    parent_id: 1
  }],
  [{
    id: 1,
    name: "Big green suitcase",
    description: "A little scratched; roomy"
  }],
  [{
    id: 2,
    name: "Ski gloves",
    description: "Red",
    parent_id: 1
  }, {
    id: 3,
    name: "Bandana",
    description: "Purple paisley",
    parent_id: 1
  }],
  [{ rows: 1 }],
  [{
    id: 1,
    name: "Big green suitcase",
    description: "A little scratched; roomy",
    parent_id: null
  }],
  [{
    id: 3,
    name: "Bandana",
    description: "Purple paisley",
    parent_id: 1
  }],
  [{
    id: 2,
    name: "Ski gloves",
    description: "Red",
    parent_id: null
  }],
  [{
    id: 1,
    name: "Big green suitcase",
    description: "A little scratched; roomy",
    parent_id: null
  }],
  [{}]
]
