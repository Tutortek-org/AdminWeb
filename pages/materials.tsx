import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { AppProps } from "next/app";
import SimpleLayout from "../components/layout/simple";
import { Material } from "../interfaces/material";
import { MaterialTableData } from "../interfaces/material-table-data";

interface Props {
  materials: Material[];
  isErrorPresent: Boolean;
}

export default function Materials({
  materials,
  isErrorPresent,
}: AppProps & Props) {
  return <SimpleLayout></SimpleLayout>;
}

const updateButtonState = (
  data: MaterialTableData[],
  material: Partial<Material>,
  id: number,
  setData: (value: React.SetStateAction<MaterialTableData[]>) => void,
  isLoading: boolean
) => {
  const index = data.findIndex((material) => material.id === id);
  const name = material.name ? material.name : "";
  const isApproved = material.isApproved ? material.isApproved : false;
  const idToAssign = material.id ? material.id : 0;
  const description = material.description ? material.description : "";
  const link = material.link ? material.link : "";
  const dataToAdd = {
    id: idToAssign,
    name: name,
    description: description,
    link: link,
    materialFlags: [isApproved, isLoading],
  };

  setData((prevData) => {
    const newData = [...prevData];
    newData[index] = {
      ...newData[index],
      ...dataToAdd,
    };
    return newData;
  });
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  const materials = await fetchMaterials(session?.accessToken as string);

  if (materials) {
    return {
      props: {
        materials,
        isErrorPresent: false,
      },
    };
  }

  return {
    props: { materials: [], isErrorPresent: true },
  };
};

const fetchMaterials = async (token: string): Promise<Material[] | null> => {
  const isServer = typeof window === "undefined";
  const host = isServer ? process.env.NEXT_PUBLIC_BASE_URL : "/tutortek-api";

  try {
    const res = await fetch(`${host}/materials/unapproved`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const materials: Material[] = await res.json();
      return materials;
    }
  } catch (e) {}

  return null;
};
