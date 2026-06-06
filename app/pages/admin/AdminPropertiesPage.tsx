import React, { useEffect,useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input,  TextArea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select, SelectContent,SelectItem, SelectTrigger, SelectValue,} from "../../components/ui/Select";
import { getProperties, createProperty, updateProperty, deleteProperty, Property, PropertyStatus, PropertyType, PropertiesResponse, formatEGPShort} from "../../../services/api";
export const AdminPropertiesPage: React.FC = () => {
  const { t, language } = useApp();
const [properties, setProperties] =
  useState<Property[]>([]);

const [totalPages, setTotalPages] =
  useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
const [selectedStatus, setSelectedStatus] = useState('all');
const [selectedLocation, setSelectedLocation] = useState('all');
const [minPrice, setMinPrice] = useState('');
const [maxPrice, setMaxPrice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);

const itemsPerPage = 6;

  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    price: '',
    location: '',
    locationAr: '',
    type: 'apartment' as PropertyType,
    status: 'available' as PropertyStatus,
    bedrooms: '',
    bathrooms: '',
    size: '',
  images: [] as File[],
  });
let modalTitle = t('propertiesMgmt.add');

if (editingProperty) {
  modalTitle =
    language === 'en'
      ? 'Edit Property'
      : 'تعديل العقار';
}
const locations = [
  ...new Set(
    properties.map((p) =>
      language === 'en'
        ? p.location
        : p.locationAr
    )
  ),
];
  const filteredProperties = properties.filter((p) => {
  const matchesSearch =
    p.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    p.titleAr.includes(searchQuery) ||
    p.location
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

  const matchesType =
    selectedType === 'all'
      ? true
      : p.type === selectedType;

  const matchesStatus =
    selectedStatus === 'all'
      ? true
      : p.status === selectedStatus;

  const currentLocation =
    language === 'en'
      ? p.location
      : p.locationAr;

  const matchesLocation =
    selectedLocation === 'all'
      ? true
      : currentLocation === selectedLocation;

  const matchesMinPrice =
    minPrice === ''
      ? true
      : p.price >= Number(minPrice);

  const matchesMaxPrice =
    maxPrice === ''
      ? true
      : p.price <= Number(maxPrice);

  return (
    matchesSearch &&
    matchesType &&
    matchesStatus &&
    matchesLocation &&
    matchesMinPrice &&
    matchesMaxPrice
  );
});
  const handleOpenModal = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        title: property.title,
        titleAr: property.titleAr,
        description: property.description,
        descriptionAr: property.descriptionAr,
        price: property.price.toString(),
        location: property.location,
        locationAr: property.locationAr,
        type: property.type,
        status: property.status,
        bedrooms: property.bedrooms.toString(),
        bathrooms: property.bathrooms.toString(),
        size: property.size.toString(),
       images: [],
      });
    } else {
      setEditingProperty(null);
      setFormData({
        title: '',
        titleAr: '',
        description: '',
        descriptionAr: '',
        price: '',
        location: '',
        locationAr: '',
        type: 'apartment',
        status: 'available',
        bedrooms: '',
        bathrooms: '',
        size: '',
       images: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProperty(null);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const form = new FormData();

    form.append("title", formData.title);
    form.append("titleAr", formData.titleAr);

    form.append("description", formData.description);
    form.append("descriptionAr", formData.descriptionAr);

    form.append("price", formData.price);

    form.append("location", formData.location);
    form.append("locationAr", formData.locationAr);

    form.append("type", formData.type);
    form.append("status", formData.status);

    form.append("bedrooms", formData.bedrooms);
    form.append("bathrooms", formData.bathrooms);

    form.append("size", formData.size);

   formData.images.forEach((image) => {
  form.append("images", image);
});

    if (editingProperty) {
      await updateProperty(editingProperty.id, form);
    } else {
      await createProperty(form);
    }

    await fetchProperties();

    handleCloseModal();

  } catch (err) {
    console.error(err);
  }
};

  const handleDelete = async (id: string) => {
  const confirmed = confirm(
    language === 'en'
      ? 'Are you sure you want to delete this property?'
      : 'هل أنت متأكد من حذف هذا العقار؟'
  );

  if (!confirmed) return;

  try {
    await deleteProperty(id);

    await fetchProperties();

  } catch (err) {
    console.error(err);
  }
};

 const handleStatusChange = async (
  id: string,
  status: PropertyStatus
) => {
  try {
    const form = new FormData();

    form.append("status", status);

    await updateProperty(id, form);

    await fetchProperties();

  } catch (err) {
    console.error(err);
  }
};

  const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'available':
      return 'default';

    case 'sold':
      return 'destructive';

    case 'rented':
      return 'secondary';

    default:
      return 'outline';
  }
};
useEffect(() => {
  fetchProperties();
}, [currentPage]);

const fetchProperties = async () => {
  try {

    const data: PropertiesResponse =
      await getProperties(
        currentPage,
        itemsPerPage
      );

    setProperties(data.properties);

    setTotalPages(data.totalPages);

  } catch (err) {
    console.error(err);
  }
};
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.properties')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'en' ? 'Manage your property listings' : 'إدارة قوائم العقارات'}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('propertiesMgmt.add')}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

  <Input
    icon={<Search className="w-5 h-5" />}
    placeholder={
      language === 'en'
        ? 'Search property...'
        : 'ابحث عن عقار...'
    }
    value={searchQuery}
    onChange={(e) =>
      setSearchQuery(e.target.value)
    }
  />

  {/* Type Filter */}
  <Select
    value={selectedType}
    onValueChange={setSelectedType}
  >
    <SelectTrigger>
      <SelectValue
        placeholder={
          language === 'en'
            ? 'Property Type'
            : 'نوع العقار'
        }
      />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="all">
        {language === 'en'
          ? 'All Types'
          : 'كل الأنواع'}
      </SelectItem>

      <SelectItem value="apartment">
        {language === 'en'
          ? 'Apartment'
          : 'شقة'}
      </SelectItem>

      <SelectItem value="villa">
        {language === 'en'
          ? 'Villa'
          : 'فيلا'}
      </SelectItem>

      <SelectItem value="house">
        {language === 'en'
          ? 'House'
          : 'منزل'}
      </SelectItem>

      <SelectItem value="land">
        {language === 'en'
          ? 'Land'
          : 'أرض'}
      </SelectItem>

      <SelectItem value="commercial">
        {language === 'en'
          ? 'Commercial'
          : 'تجاري'}
      </SelectItem>
    </SelectContent>
  </Select>

  {/* Status Filter */}
  <Select
    value={selectedStatus}
    onValueChange={setSelectedStatus}
  >
    <SelectTrigger>
      <SelectValue
        placeholder={
          language === 'en'
            ? 'Status'
            : 'الحالة'
        }
      />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="all">
        {language === 'en'
          ? 'All Status'
          : 'كل الحالات'}
      </SelectItem>

      <SelectItem value="available">
        {t('property.available')}
      </SelectItem>

      <SelectItem value="sold">
        {t('property.sold')}
      </SelectItem>

      <SelectItem value="rented">
        {t('property.rented')}
      </SelectItem>
    </SelectContent>
  </Select>

  {/* Location Filter */}
  <Select
    value={selectedLocation}
    onValueChange={setSelectedLocation}
  >
    <SelectTrigger>
      <SelectValue
        placeholder={
          language === 'en'
            ? 'Location'
            : 'الموقع'
        }
      />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="all">
        {language === 'en'
          ? 'All Locations'
          : 'كل المناطق'}
      </SelectItem>

      {locations.map((location) => (
        <SelectItem
          key={location}
          value={location}
        >
          {location}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Min Price */}
  <Input
    type="number"
    placeholder={
      language === 'en'
        ? 'Min Price'
        : 'أقل سعر'
    }
    value={minPrice}
    onChange={(e) =>
      setMinPrice(e.target.value)
    }
  />

  {/* Max Price */}
  <Input
    type="number"
    placeholder={
      language === 'en'
        ? 'Max Price'
        : 'أعلى سعر'
    }
    value={maxPrice}
    onChange={(e) =>
      setMaxPrice(e.target.value)
    }
  />

</div>

      {/* Properties Table/Grid */}
      {viewMode === 'table' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'en' ? 'Image' : 'الصورة'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('propertiesMgmt.title')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('propertiesMgmt.price')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'en' ? 'Location' : 'الموقع'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('propertiesMgmt.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('propertiesMgmt.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={property.images[0]}
                        alt={language === 'en' ? property.title : property.titleAr}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {language === 'en' ? property.title : property.titleAr}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{property.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatEGPShort(property.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {language === 'en' ? property.location : property.locationAr}
                      </div>
                    </td>
               <td className="px-6 py-4 whitespace-nowrap">
                <Select
                  value={property.status}
                  onValueChange={(value) =>
                    handleStatusChange(property.id, value as PropertyStatus)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="available">
                      {t('property.available')}
                    </SelectItem>

                    <SelectItem value="sold">
                      {t('property.sold')}
                    </SelectItem>

                    <SelectItem value="rented">
                      {t('property.rented')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(property)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={property.images?.[0] || '/placeholder.jpg'}
                  alt={language === 'en' ? property.title : property.titleAr}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant={getStatusBadgeVariant(property.status)}>{t(`property.${property.status}`)}</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {language === 'en' ? property.title : property.titleAr}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {language === 'en' ? property.location : property.locationAr}
                </p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
                  {formatEGPShort(property.price)}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleOpenModal(property)} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(property.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

{/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">

        <Button
          variant="secondary"
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((prev) => prev - 1)
          }
        >
          {language === 'en' ? 'Previous' : 'السابق'}
        </Button>

        <span className="text-sm">
          {language === 'en'
            ? `Page ${currentPage} of ${totalPages}`
            : `صفحة ${currentPage} من ${totalPages}`}
        </span>

        <Button
          variant="secondary"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => prev + 1)
          }
        >
          {language === 'en' ? 'Next' : 'التالي'}
        </Button>

      </div>

      {/* Add/Edit Modal */}
     <Modal
  isOpen={showModal}
  onClose={handleCloseModal}
  title={modalTitle}
  size="lg"
        footer={
  <>
    <Button variant="secondary" onClick={handleCloseModal}>
      {t('common.cancel')}
    </Button>

    <Button type="submit" form="propertyForm">
      {t('common.save')}
    </Button>
  </>
}
      >
        <form
  id="propertyForm"
  onSubmit={handleSubmit}
  className="space-y-4"
>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={language === 'en' ? 'Title (English)' : 'العنوان (إنجليزي)'}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label={language === 'en' ? 'Title (Arabic)' : 'العنوان (عربي)'}
              value={formData.titleAr}
              onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              required
            />
          </div>

         <div className="grid grid-cols-2 gap-4">
  <TextArea
    name="description"
    label={language === 'en' ? 'Description (English)' : 'الوصف (إنجليزي)'}
    value={formData.description}
    onChange={(e) =>
      setFormData({
        ...formData,
        description: e.target.value,
      })
    }
    rows={3}
    required
  />

  <TextArea
    name="descriptionAr"
    label={language === 'en' ? 'Description (Arabic)' : 'الوصف (عربي)'}
    value={formData.descriptionAr}
    onChange={(e) =>
      setFormData({
        ...formData,
        descriptionAr: e.target.value,
      })
    }
    rows={3}
    required
  />
</div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={language === 'en' ? 'Price (EGP)' : 'السعر (ج.م)'}
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label={language === 'en' ? 'Size (m²)' : 'المساحة (م²)'}
              type="number"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={language === 'en' ? 'Location (English)' : 'الموقع (إنجليزي)'}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <Input
              label={language === 'en' ? 'Location (Arabic)' : 'الموقع (عربي)'}
              value={formData.locationAr}
              onChange={(e) => setFormData({ ...formData, locationAr: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

  {/* Property Type */}
  <div>
    <label className="text-sm mb-1 block">
      {language === 'en' ? 'Property Type' : 'نوع العقار'}
    </label>

    <Select
      value={formData.type}
      onValueChange={(value) =>
        setFormData({ ...formData, type: value as PropertyType })
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Select Type" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="apartment">
          {language === 'en' ? 'Apartment' : 'شقة'}
        </SelectItem>

        <SelectItem value="villa">
          {language === 'en' ? 'Villa' : 'فيلا'}
        </SelectItem>

        <SelectItem value="house">
          {language === 'en' ? 'House' : 'منزل'}
        </SelectItem>

        <SelectItem value="land">
          {language === 'en' ? 'Land' : 'أرض'}
        </SelectItem>

        <SelectItem value="commercial">
          {language === 'en' ? 'Commercial' : 'تجاري'}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Status */}
  <div>
    <label className="text-sm mb-1 block">
      {language === 'en' ? 'Status' : 'الحالة'}
    </label>

    <Select
      value={formData.status}
      onValueChange={(value) =>
        setFormData({ ...formData, status: value as PropertyStatus })
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Select Status" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="available">
          {t('property.available')}
        </SelectItem>

        <SelectItem value="sold">
          {t('property.sold')}
        </SelectItem>

        <SelectItem value="rented">
          {t('property.rented')}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>

</div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={language === 'en' ? 'Bedrooms' : 'غرف النوم'}
              type="number"
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              required
            />
            <Input
              label={language === 'en' ? 'Bathrooms' : 'الحمامات'}
              type="number"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              required
            />
          </div>

       <div>
  <label className="block text-sm mb-2">
    {language === 'en' ? 'Property Images' : 'صور العقار'}
  </label>

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={(e) =>
      setFormData({
        ...formData,
        images: Array.from(e.target.files || []),
      })
    }
    className="w-full border rounded-lg p-2"
  />
</div>
        </form>
      </Modal>
    </div>
  );
};