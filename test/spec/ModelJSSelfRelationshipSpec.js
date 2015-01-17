describe('ModelJS self relationships', function() {

  var modelJS;
  var storage;
  var schema = {
    Node: {
      attrs: ['content'],
      relsToOne: ['Node']
    },
  };
  
  beforeEach(function() {
    modelJS = new ModelJS(schema);
    modelJS.storage.clean();
  });

  afterAll(function() {
    modelJS.storage.clean();
  });

  it('should handle self relationships `to one`', function() {
    var root = modelJS.save('Node', {content:'A'});
    var child = modelJS.save('Node', {content:'B', _nodeId: root.id});

    expect(child.Node).toEqual(root);
    expect(child.nodeId).toEqual(root.id);
  });

  it('should handle the inverse of self relationships `to one`', function() {
    var root = modelJS.save('Node', {content:'A'});
    
    var numberOfRootChilds = 10;
    for (var i = 0; i < 10; i++) {
      modelJS.save('Node', {content:'B' + i, _nodeId: root.id});
    }

    expect(root.Nodes.length).toEqual(numberOfRootChilds);

    modelJS.save('Node', {content:'C', _nodeId: root.Nodes[0].id});
    expect(root.Nodes[0].Nodes.length).toEqual(1);
    expect(root.Nodes.length).toEqual(numberOfRootChilds);
  });

});
