from prisma import Prisma
from prisma.models import group_extensions, extensions
from typing import List, Optional

# Function to get all group extensions by domain
async def get_group_extensions_by_domain(db: Prisma, domain_id: str) -> list[group_extensions]:
    """
    Retrieves all group extensions for a given domain, including their associated extensions.
    """
    try:
        groups = await db.group_extensions.find_many(
            where={"domain_id": domain_id},
            include={"extensions": True}
        )
        return groups
    except Exception as e:
        print(f"Error fetching group extensions: {e}")
        return []

# Function to get available extensions (not assigned to any group) by domain
async def get_available_extensions_by_domain(db: Prisma, domain_id: str) -> list[extensions]:
    """
    Retrieves all extensions for a given domain that are not currently assigned to any group.
    """
    available_extensions = await db.extensions.find_many(
        where={
            "domain_id": domain_id,
            "group_id": None
        }
    )
    return available_extensions

# Function to create a new group extension
async def create_group_extension(db: Prisma, name: str, description: str, domain_id: str, extension_ids: list[str]) -> group_extensions:
    """
    Creates a new group extension and assigns the specified extensions to it.
    """
    # Create the new group first
    new_group = await db.group_extensions.create(
        data={
            "name": name,
            "description": description,
            "domain_id": domain_id,
            "is_active": True
        }
    )

    # Update the selected extensions to link them to the new group
    if extension_ids:
        await db.extensions.update_many(
            where={"extension_id": {"in": extension_ids}},
            data={"group_id": new_group.group_id}
        )

    # Fetch the newly created group with its extensions to return it
    created_group_with_extensions = await db.group_extensions.find_unique(
        where={"group_id": new_group.group_id},
        include={"extensions": True}
    )

    return created_group_with_extensions

# Function to delete a group extension
async def delete_group_extension(db: Prisma, group_id: str) -> bool:
    """
    Deletes a group extension after disassociating its extensions.
    Returns True if successful, False otherwise.
    """
    try:
        # First, find all extensions in the group and set their group_id to null
        await db.extensions.update_many(
            where={"group_id": group_id},
            data={"group_id": None}
        )

        # Then, delete the group itself
        await db.group_extensions.delete(
            where={"group_id": group_id}
        )
        return True
    except Exception as e:
        print(f"Error deleting group extension: {e}")
        return False

# Function to update a group extension
async def update_group_extension(
    db: Prisma,
    group_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    is_active: Optional[bool] = None,
    extension_ids: Optional[List[str]] = None
) -> Optional[group_extensions]:
    """
    Updates a group extension's details and its associated extensions.
    """
    try:
        # Use a transaction to ensure atomicity
        async with db.tx() as transaction:
            # 1. Update group's name and description if provided
            update_data = {}
            if name is not None:
                update_data["name"] = name
            if description is not None:
                update_data["description"] = description
            if is_active is not None:
                update_data["is_active"] = is_active
            
            if update_data:
                await transaction.group_extensions.update(
                    where={"group_id": group_id},
                    data=update_data
                )

            # 2. If extension_ids are provided, manage the associations
            if extension_ids is not None:
                # First, disassociate all extensions currently linked to this group
                await transaction.extensions.update_many(
                    where={"group_id": group_id},
                    data={"group_id": None}
                )

                # Then, associate the new list of extensions with this group
                if extension_ids: # Only run if the list is not empty
                    await transaction.extensions.update_many(
                        where={"extension_id": {"in": extension_ids}},
                        data={"group_id": group_id}
                    )
        
        # 3. Fetch the fully updated group to return
        updated_group = await db.group_extensions.find_unique(
            where={"group_id": group_id},
            include={"extensions": True}
        )
        return updated_group

    except Exception as e:
        print(f"Error updating group extension: {e}")
        return None
