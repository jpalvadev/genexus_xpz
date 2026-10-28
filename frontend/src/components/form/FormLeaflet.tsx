import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMapEvent,
} from 'react-leaflet';
import { FormBase, type FormControlProps } from './FormBase';
import { useFieldContext } from './hooks';
import type { Coordinate } from '@/types/coordinate.type';

export default function FormLeaflet(props: FormControlProps) {
    const field = useFieldContext<Coordinate[]>();

    console.log(field);

    function HandleMapClick() {
        useMapEvent('click', (e) => {
            if (props.disabled) return;
            field.handleChange((prev) => [
                ...prev,
                { lat: e.latlng.lat, lng: e.latlng.lng },
            ]);
        });

        return null;
    }

    return (
        <FormBase {...props}>
            <MapContainer
                center={[-32.45441004969211, -60.88847684951682]}
                zoom={14}
                scrollWheelZoom={true}
                className="h-125"
            >
                <TileLayer
                    attribution="React Movies"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <HandleMapClick />

                {field.state.value?.map((coordinate) => (
                    <Marker
                        key={`${coordinate.lat}-${coordinate.lng}`}
                        position={[coordinate.lat, coordinate.lng]}
                    >
                        {coordinate.message ? (
                            <Popup>{coordinate.message}</Popup>
                        ) : null}
                    </Marker>
                ))}
            </MapContainer>
        </FormBase>
    );
}
