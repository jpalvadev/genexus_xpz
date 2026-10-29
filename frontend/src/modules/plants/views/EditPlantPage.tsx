import { getRouteApi } from '@tanstack/react-router';

import { UpdatePlantPage } from '../plant.config';

const routeApi = getRouteApi('/_layout/plants/$id/edit');

/** Route adapter: the loader lives in the route file; the produced UpdatePage
 *  stays presentational and receives the record as a prop. */
export default function EditPlantPage() {
    return <UpdatePlantPage initialData={routeApi.useLoaderData()} />;
}
