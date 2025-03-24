// src/server/graphql/schema.ts
import { gql } from 'graphql-tag';

export const typeDefs = gql`
  enum Role {
    USER
    ADMIN
  }

  enum TransactionType {
    INCOME
    EXPENSE
  }

  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
    role: Role!
    transactions: [Transaction!]!
    createdAt: String!
    updatedAt: String!
  }

  type Transaction {
    id: ID!
    amount: Float!
    concept: String!
    date: String!
    type: TransactionType!
    user: User!
    createdAt: String!
    updatedAt: String!
  }

  type FinancialSummary {
    totalIncome: Float!
    totalExpense: Float!
    balance: Float!
    incomeCount: Int!
    expenseCount: Int!
  }

  type MonthlyStats {
    month: String!
    income: Float!
    expense: Float!
    balance: Float!
  }

  type Query {
    # User queries
    me: User
    
    # Transaction queries
    transactions(
      type: TransactionType
      startDate: String
      endDate: String
      userId: ID
    ): [Transaction!]!
    
    transaction(id: ID!): Transaction
    
    # Financial data queries
    financialSummary: FinancialSummary!
    monthlyStats(year: Int): [MonthlyStats!]!
    
    # Admin only queries
    allUsers: [User!]!
  }

  type Mutation {
    # Transaction mutations
    createTransaction(
      amount: Float!
      concept: String!
      date: String!
      type: TransactionType!
    ): Transaction!
    
    updateTransaction(
      id: ID!
      amount: Float
      concept: String
      date: String
      type: TransactionType
    ): Transaction!
    
    deleteTransaction(id: ID!): Transaction!
    
    # Admin only mutations
    updateUser(
      userId: ID!
      name: String
      phone: String
      role: Role
    ): User!
  }
`;