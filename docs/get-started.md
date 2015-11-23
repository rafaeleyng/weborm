# Get Started With ModelJS

[Model-JS on GitHub](https://github.com/rafaeleyng/model-js)

## Schema

You must define a schema in order to work with ModelJS. There are 2 ways to define your schema: using a plain JavaScript objects or using the `ModelJS.SchemaEntity` constructor.

Using plain JavaScript objects:

```
var schema = {
  _Base: {
    attrs: ['name'],
  },

  Game: {},

  Player: {
    attrs: ['score'],
    relsToOne: ['Game'],
    relsToMany: ['Badge']
  },

  Badge: {
    attrs: ['description']
  }
};
```

Using the `ModelJS.SchemaEntity` constructor:


```
var schema = {
  _Base:  new ModelJS.SchemaEntity(['name']),
  Game:   new ModelJS.SchemaEntity(),
  Player: new ModelJS.SchemaEntity(['score'], ['Game'], ['Badge']),
  Badge:  new ModelJS.SchemaEntity(['description'])
};
```

The order of the parameters is
```
ModelJS.SchemaEntity(attrs, relsToOne, relsToMany);
```


## Inheritance

Every ModelJSEntity object inherits attributes from an entity called `_DefaultBase`. Currently, the only inherited attribute is the `id`, which works pretty much as an id in a relational database.

Additionaly, you can specify a custom base entity, which *must* be called `_Base`. Every ModelJSEntity object will inherit the attributes defined in your `_Base`.

Note that defining a `_Base` won't have any impact on the `_DefaultBase`. So **you don't have to define the `id` attribute** yourself.


## Config

You can, optionally, pass a configuration object. Currently, there are only one possible configuration:

* `pluralization`: ModelJS pluralizes entity names by just adding an 's' at the end of the word. If you want to have a correct pluralization for your entity names, you should pass everything that doesn't follow this pattern.

```
var config = {
  pluralization: {
    Country: 'Countries',
    City: 'Cities'
  }
};
```


## Initializing ModelJS

```
var modeljs = new ModelJS(schema, config);
```


## CRUD

### Create

```
var rafael = modeljs.save('Person', {name: 'Rafael', profession: 'Dev'});`
var id = rafael.id; // generated id
```

### Read

```
var rafael = modeljs.find('Person', id);
```

### Update

```
rafael.name = 'Rafael Eyng';

rafael.save();
// or
modeljs.save('Person', rafael);
```

### Delete

```
rafael.delete();
// or
modeljs.delete('Person', id);
```

## Other operations

### all, count, first, last, page

```
var people = modeljs.all('Person');
var count = modeljs.count('Person');

var first = modeljs.first('Person');
var last = modeljs.last('Person');

var page1 = modeljs.page('Person', 0, 10); // page number, page size
```

### filter

Allows you to perform more complex queries

```
var rafaelDev = modljs.filter('Person', function(record) {
  return record.name === 'Rafael' && record.profession.toLowerCase() === 'dev';
});
```


## Relationships

### Relationships 'to one'

You can set a relationship when creating a new object:

```
var brazil = modeljs.save('Country', {name: 'Brazil'});
var rs = modeljs.save('State',
  {
    name: 'Rio Grande do Sul',
    _countryId: brazil.id
  }
);

rs.Country.name; // 'Brazil'
rs.countryId; // 1
```

Or later:

```
var brazil = modeljs.save('Country', {name: 'Brazil'});
var rs = modeljs.save('State', {name: 'Rio Grande do Sul'});

rs.Country = brazil;
// or
rs.countryId = brazil.id;

rs.save();
```

ModelJS will handle the inverse relationship:

```
var rs = modeljs.save('State', {name: 'Rio Grande do Sul'});

var portoAlegre = modeljs.save('City', {name: 'Porto Alegre', _stateId: rs.id});
var feliz = modeljs.save('City', {name: 'Feliz', _stateId: rs.id});

rs.Cities; // [portoAlegre, feliz]
```

### Relationships 'to many'

You can `add` objects `To`, and `remove` objects `From` a 'to many' relationship

```
var bronze = modeljs.save('Badge', {name: 'Bronze'});
var silver = modeljs.save('Badge', {name: 'Silver'});
var gold = modeljs.save('Badge', {name: 'Gold'});

var player = modeljs.save('Player', {
  name: 'Bob',
  _badgesId: [bronze.id, silver.id]
});

modeljs.addTo(gold, player);

player.Badges.length; // 3
player.Badges[2].name; // 'Gold'

modeljs.removeFrom(silver, player);

player.Badges.length; // 2
player.Badges[1].name; // 'Gold'

```
