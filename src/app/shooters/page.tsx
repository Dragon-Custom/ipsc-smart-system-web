"use client";
import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Query } from "@/gql/graphql";
import { AgGridReact } from "ag-grid-react";

const GET_ALL_SHOOTERS_QUERY = gql`
    query FindManyShooter{
        findManyShooter {
            division
        }
    }
`;

export default function Shooters() {
	const { data } = useQuery<Query>(GET_ALL_SHOOTERS_QUERY);
	return (
		<>
			{JSON.stringify(data?.findManyShooter)}
            Shooters
		</>
	);
}
