import { ReactNode } from "react";
import { Flex, Menu } from "@chakra-ui/react";
import Link from "next/link";

type Props = {
    children?: ReactNode;
};

export default function Header({ children }: Props) {
    return (
        <Menu>
            <Flex
                display={"flex"}
                alignItems="center"
                justifyContent="space-between"
                maxW="83.43rem"
                mx="auto"
                pt="1.5rem">
                <Link href="/"><b className="logo" style={{ fontSize: "1.4em" }}>AISwap</b></Link>
                {children}
            </Flex>
        </Menu>
    );
}