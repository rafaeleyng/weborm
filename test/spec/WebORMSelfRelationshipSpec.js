describe('WebORM self relationships', function() {

  var weborm;
  var storage;
  var schema = {
    Node: {
      attrs: ['content'],
      relsToOne: ['Node']
    },
  };
  
  beforeEach(function() {
    weborm = new WebORM(schema);
    weborm.storage.clean();
  });

  afterAll(function() {
    weborm.storage.clean();
  });

  it('should handle self relationships `to one`', function() {
    var root = weborm.save('Node', {content:'A'});
    var child = weborm.save('Node', {content:'B', _nodeId: root.id});

    expect(child.Node).toEqual(root);
    expect(child.nodeId).toEqual(root.id);
  });

  it('should handle the inverse of self relationships `to one`', function() {
    var root = weborm.save('Node', {content:'A'});
    
    var numberOfRootChilds = 10;
    for (var i = 0; i < 10; i++) {
      weborm.save('Node', {content:'B' + i, _nodeId: root.id});
    }

    expect(root.Nodes.length).toEqual(numberOfRootChilds);

    weborm.save('Node', {content:'C', _nodeId: root.Nodes[0].id});
    expect(root.Nodes[0].Nodes.length).toEqual(1);
    expect(root.Nodes.length).toEqual(numberOfRootChilds);
  });

});
