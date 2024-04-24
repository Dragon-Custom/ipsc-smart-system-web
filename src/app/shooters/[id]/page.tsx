"use client";
import { Query, QueryFindUniqueShooterArgs } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Typography } from "@mui/material";
import { useParams } from "next/navigation";
import React from "react";


const FetchQuery = gql`
	query ($where: ShooterWhereUniqueInput!){
		findUniqueShooter(where:$where) {
			id
			createAt
			division
			email
			name
			score {
				hitFactor
			}
		}
	}
`;

export default function ShooterStatisticPage() {
	const params = useParams();
	const id = parseInt(params.id as string);
	if (isNaN(id))
		// eslint-disable-next-line react/no-unescaped-entities
		return <>ERROR: you've passed a illegle shooter id</>;
	
	const query = useQuery<Query, QueryFindUniqueShooterArgs>(FetchQuery, {
		variables: {
			where: {
				id,
			},
		},
	});


	if (query.loading || !query.data) {
		return <>Loading...</>;
	}

	return (
		<>
			<Typography>Shooter statistic { JSON.stringify(query.data)}</Typography>
		</>
	); 
}