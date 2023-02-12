import { Flex, Text } from '@mantine/core';
import { Outlet, useOutletContext } from '@remix-run/react';

export default function Note() {
    const context = useOutletContext();
    return <Outlet context={context} />;
}

export const CatchBoundary = () => {
    return (
        <Flex justify='center' align='center' w='100%' h='100%'>
            <Text size={32}>ノートが見つかりませんでした</Text>
        </Flex>
    );
};
