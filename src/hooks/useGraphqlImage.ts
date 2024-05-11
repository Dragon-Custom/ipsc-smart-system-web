import { Query } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { useState } from "react";

const GetImageQuery = gql`
	query($id: String!){
		image(id: $id)
	}
`;

type JpegBase64Image = string;
export default function useGraphqlImage(id: string): JpegBase64Image {
	const [base64Img, setBase64Img] = useState("");
	useQuery<Query>(GetImageQuery, {
		variables: {
			id: id,
		},
		onCompleted(data) {
			setBase64Img("data:image/jpeg;base64," + data.image);
		},
	});
	return base64Img;
}