'use client';

import { gql } from '@apollo/client';

// Transaction Queries
export const GET_TRANSACTIONS = gql`
  query GetTransactions($type: TransactionType, $startDate: String, $endDate: String, $userId: ID) {
    transactions(type: $type, startDate: $startDate, endDate: $endDate, userId: $userId) {
      id
      amount
      concept
      date
      type
      user {
        id
        name
      }
    }
  }
`;

export const GET_TRANSACTION = gql`
  query GetTransaction($id: ID!) {
    transaction(id: $id) {
      id
      amount
      concept
      date
      type
      user {
        id
        name
      }
    }
  }
`;

// Financial Data Queries
export const GET_FINANCIAL_SUMMARY = gql`
  query GetFinancialSummary {
    financialSummary {
      totalIncome
      totalExpense
      balance
      incomeCount
      expenseCount
    }
  }
`;

export const GET_MONTHLY_STATS = gql`
  query GetMonthlyStats($year: Int) {
    monthlyStats(year: $year) {
      month
      income
      expense
      balance
    }
  }
`;

// User Queries
export const GET_ALL_USERS = gql`
  query GetAllUsers {
    allUsers {
      id
      name
      email
      phone
      role
      createdAt
    }
  }
`;

export const GET_MY_PROFILE = gql`
  query GetMyProfile {
    me {
      id
      name
      email
      phone
      role
    }
  }
`;

// Transaction Mutations
export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($amount: Float!, $concept: String!, $date: String!, $type: TransactionType!) {
    createTransaction(amount: $amount, concept: $concept, date: $date, type: $type) {
      id
      amount
      concept
      date
      type
    }
  }
`;

export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($id: ID!, $amount: Float, $concept: String, $date: String, $type: TransactionType) {
    updateTransaction(id: $id, amount: $amount, concept: $concept, date: $date, type: $type) {
      id
      amount
      concept
      date
      type
    }
  }
`;

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id) {
      id
    }
  }
`;

// User Mutations
export const UPDATE_USER = gql`
  mutation UpdateUser($userId: ID!, $name: String, $phone: String, $role: Role) {
    updateUser(userId: $userId, name: $name, phone: $phone, role: $role) {
      id
      name
      phone
      role
    }
  }
`;