const { graphqlHandler, graphqlError } = require('graphql-serverless')
const { makeExecutableSchema } = require('graphql-tools') 
const { app } = require('webfunc')

const itemMocks = [
  { id: 1, name: 'Knock Bits', quantity: 88, price: 12.67, supplier_id: 1 }, 
  { id: 2, name: 'Widgets', quantity: 10, price: 35.50, supplier_id: 3 }]

const supplierMocks = [{id : 1, name : `Reese's Store`, address : `123 address street`},
			{id : 3, name : `Rival Store`, address : `123 dont come here`}]

const schema = `
  type Item {
    id: ID!
    name: String!
    quantity: Int
    price: Float
    supplier_id: Int
  }
  type Supplier{
    id: ID!
    name: String!
    address: String
  } 
  type Query {
      itemsById(id: Int): Item,
      items : [Item],
      itemsByName(name: String): [Item],
      supplierById(id: Int): [Supplier]
  }

  type Mutation {
	addItem(id: Int, name: String, quantity: Int, price: Float, supplier_id: Int) : Item
  }
  `
 
const itemResolver = {
  Query: {
      itemsById(root, { id }, context) {
		const results = id ? itemMocks.filter(p => p.id == id) : itemMocks
		      if (results.length > 0)
			return results.pop()
		      else
			throw graphqlError(404, `Item with id ${id} does not exist.`)
      },
      items(root, {}, context){
		const results = itemMocks
	      	if(results.length > 0)
		      return results
	      	else
		      throw graphqlError(404, `No Item is found`)
      },
      itemsByName(root, { name }, context){
		const results = name ? itemMocks.filter(p => p.name == name) : itemMocks
	      	if (results.length>0)
		      return results
	      	else
		      throw graphqlError(404, `Item with name: ${name} does not exist`)
      },
      supplierById(root, {id}, context){
	      const results = id ? supplierMocks.filter(p => p.id == id) : supplierMocks
	      if (results.length>0)
		      return results
	      else
		      throw graphqlError(404, `Supplier ID: ${id} was not found`)
      }
   },
  Mutation: {
	addItem(root, {id, name, quantity, price, supplier_id}, context){
		const item = {id : id, name : name, quantity : quantity,  price : price, supplier_id : supplier_id}
		itemMocks.push(item)
		return item
	}
  }
}

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: itemResolver
})

const graphqlOptions = {
  schema: executableSchema,
  graphiql: { 
    endpoint: '/graphiql' 
  },
  context: {
  	someVar: 'This variable is passed in the "context" object in each resolver.'
  }
}

app.all(['/','/graphiql'], graphqlHandler(graphqlOptions))

eval(app.listen('app', 4000))
